import {
  calculateGameState,
  defaultGameState,
  GameEvent,
  IGameState,
  IPlayerBankerStatusChangeEvent,
  IPlayerColorChangeEvent,
  IPlayerConnectionChangeEvent,
  IPlayerJoinEvent,
  PlayerId
} from "@monopoly-money/game-state";
import * as websocket from "ws";
import {
  IGameEndMessage,
  IInitialEventArrayMessage,
  INewEventMessage,
  OutgoingMessage
} from "../api/dto";
import { generateRandomId, generateTimeBasedId, getCurrentTime } from "./utils";

export const BANKER_HOST_PLAYER_ID = "banker-host";

// === FAKE DATA FOR TESTING ===
const FAKE_DATA_ENABLED = true;
const FAKE_PLAYER_COUNT = 6;
const FAKE_PLAYER_NAMES = ["Alice", "Bob", "Charlie", "Diana", "Evan", "Fiona", "George", "Hannah", "Ian", "Julia", "Kevin", "Luna"];
const FAKE_COLORS = ["#e6194b", "#3cb44b", "#ffe119", "#0082c8", "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#d2f53c", "#fabebe"];
// =============================

export default class Game {
  private events: GameEvent[] = []; // Events in this game
  private subscribedWebSockets: Record<string, websocket> = {}; // playerId or banker-host: event websocket
  private userTokenToPlayers: Record<string, PlayerId> = {}; // A mapping of ids only known by a user to match to a player
  private adminTokens: string[] = []; // Tokens for banker-only hosts (no player account)
  private gameState: IGameState = defaultGameState;

  private deleteInstance: () => void;

  constructor(deleteInstance: () => void) {
    this.deleteInstance = deleteInstance;
  }

  public injectFakeData = () => {
    if (!FAKE_DATA_ENABLED) return;
    const count = Math.min(FAKE_PLAYER_COUNT, FAKE_PLAYER_NAMES.length);
    const createdPlayerIds: string[] = [];
    for (let i = 0; i < count; i++) {
      const playerId = generateTimeBasedId();
      createdPlayerIds.push(playerId);
      const joinEvent: IPlayerJoinEvent = {
        type: "playerJoin",
        time: getCurrentTime(),
        actionedBy: playerId,
        playerId,
        name: FAKE_PLAYER_NAMES[i],
        color: FAKE_COLORS[i % FAKE_COLORS.length]
      };
      this.events.push(joinEvent);
      this.gameState = calculateGameState([joinEvent], this.gameState);
      const connEvent: IPlayerConnectionChangeEvent = {
        type: "playerConnectionChange",
        time: getCurrentTime(),
        actionedBy: playerId,
        playerId,
        connected: true
      };
      this.events.push(connEvent);
      this.gameState = calculateGameState([connEvent], this.gameState);
    }
    const transactions = [
      { from: "bank" as const, to: createdPlayerIds[0], amount: 200 },
      { from: "bank" as const, to: createdPlayerIds[1], amount: 200 },
      { from: createdPlayerIds[0], to: "bank" as const, amount: 150 },
      { from: createdPlayerIds[1], to: createdPlayerIds[2], amount: 50 },
      { from: "bank" as const, to: createdPlayerIds[2], amount: 200 },
      { from: createdPlayerIds[2], to: "bank" as const, amount: 100 },
      { from: createdPlayerIds[0], to: createdPlayerIds[3], amount: 75 },
      { from: "bank" as const, to: createdPlayerIds[3], amount: 200 },
      { from: createdPlayerIds[3], to: "freeParking" as const, amount: 100 },
      { from: createdPlayerIds[1], to: "bank" as const, amount: 200 },
      { from: "bank" as const, to: createdPlayerIds[4], amount: 200 },
      { from: createdPlayerIds[4], to: createdPlayerIds[0], amount: 25 },
      { from: createdPlayerIds[0], to: "bank" as const, amount: 50 },
      { from: "bank" as const, to: createdPlayerIds[5], amount: 200 },
      { from: createdPlayerIds[5], to: createdPlayerIds[2], amount: 120 },
      { from: createdPlayerIds[2], to: "bank" as const, amount: 60 },
      { from: createdPlayerIds[3], to: createdPlayerIds[4], amount: 40 },
      { from: createdPlayerIds[4], to: "bank" as const, amount: 150 },
      { from: "bank" as const, to: createdPlayerIds[0], amount: 100 },
      { from: createdPlayerIds[1], to: "freeParking" as const, amount: 75 },
    ];
    for (const tx of transactions) {
      const txEvent = {
        type: "transaction" as const,
        time: getCurrentTime(),
        actionedBy: tx.from === "bank" || tx.from === "freeParking" ? (createdPlayerIds[0] ?? "bank") : tx.from,
        from: tx.from,
        to: tx.to,
        amount: tx.amount
      };
      this.events.push(txEvent);
      this.gameState = calculateGameState([txEvent], this.gameState);
    }
  };

  // Check if a game is open
  public isGameOpen = () => this.gameState.open;

  // Check if a userToken is in a game
  public isUserInGame = (userToken: string) =>
    this.userTokenToPlayers.hasOwnProperty(userToken) || this.adminTokens.includes(userToken);

  // Check if a userToken is allowed to make banker actions in a game
  public isUserABanker = (userToken: string) => {
    if (this.adminTokens.includes(userToken)) {
      return true;
    }
    const playerId = this.userTokenToPlayers[userToken];
    const player = this.gameState.players.find((p) => p.playerId === playerId);
    return player !== undefined && player.banker;
  };

  public getPlayerId = (userToken: string) =>
    this.userTokenToPlayers[userToken] ?? BANKER_HOST_PLAYER_ID;

  // Add a banker-only host (no player account)
  public addBankerHost = () => {
    const userToken = generateRandomId();
    this.adminTokens.push(userToken);
    return { userToken, playerId: BANKER_HOST_PLAYER_ID };
  };

  // Add a player to a game and get the new userToken
  public addPlayer = (name: string, color?: string) => {
    // Identify id
    const playerId = generateTimeBasedId();
    const userToken = generateRandomId();

    // Add the player
    const event: IPlayerJoinEvent = {
      type: "playerJoin",
      time: getCurrentTime(),
      actionedBy: playerId,
      playerId,
      name,
      color: color || ""
    };
    this.pushEvent(event);

    // Map the user token to the player id
    this.userTokenToPlayers[userToken] = playerId;

    return { userToken, playerId };
  };

  // Change a player's color
  public setPlayerColor = (playerId: string, color: string, actionedByPlayerId: string) => {
    const event: IPlayerColorChangeEvent = {
      type: "playerColorChange",
      time: getCurrentTime(),
      actionedBy: actionedByPlayerId,
      playerId,
      color
    };
    this.pushEvent(event);
  };

  // Set a player as a banker
  public setPlayerBankerStatus = (
    playerId: string,
    isBanker: boolean,
    actionedByPlayerId: string
  ) => {
    const event: IPlayerBankerStatusChangeEvent = {
      type: "playerBankerStatusChange",
      time: getCurrentTime(),
      actionedBy: actionedByPlayerId,
      playerId,
      isBanker
    };
    this.pushEvent(event);
  };

  // Record a players websocket connection in-game
  public playerConnectionStatusChange = (playerId: string, connected: boolean) => {
    // Skip for banker-only hosts
    if (playerId === BANKER_HOST_PLAYER_ID) {
      return;
    }

    // Verify the player is still in the game (will not be if they were kicked)
    if (this.gameState.players.find((p) => p.playerId) !== undefined) {
      // If the player is still in the game, update their state
      const event: IPlayerConnectionChangeEvent = {
        type: "playerConnectionChange",
        time: getCurrentTime(),
        actionedBy: playerId,
        playerId,
        connected
      };
      this.pushEvent(event);
    }
  };

  // Subscribe a websocket to get any event updates
  public subscribeWebSocketToEvents = (ws: websocket, playerId: string) => {
    // Add to subscription list
    this.subscribedWebSockets[playerId] = ws;

    // Send out events that have ocurred
    const outgoingMessage: IInitialEventArrayMessage = {
      type: "initialEventArray",
      events: this.events
    };
    ws.send(JSON.stringify(outgoingMessage));

    // Tell listeners that this player is now connected (skip for banker-only hosts)
    if (playerId !== BANKER_HOST_PLAYER_ID) {
      this.playerConnectionStatusChange(playerId, true);
    }
  };

  // Get the game state
  public getGameState = (): IGameState => {
    return this.gameState;
  };

  // Add an event
  public addEvent = (event: GameEvent, actionedBy: PlayerId) => {
    this.pushEvent({
      ...event,
      actionedBy,
      time: getCurrentTime()
    });

    // If a player has been deleted, close their websocket and remove their user token
    if (event.type === "playerDelete") {
      this.removePlayerWebSocket(event.playerId);
      const userToken = Object.keys(this.userTokenToPlayers).find(
        (token) => this.userTokenToPlayers[token] === event.playerId
      );
      if (userToken !== undefined) {
        delete this.userTokenToPlayers[userToken];
      }
    }

    // If all bankers have removed themselves, end the game
    const bankerPlayers = this.gameState.players.filter((p) => p.banker);
    if (bankerPlayers.length === 0 && this.adminTokens.length === 0) {
      this.endGame();
    }
  };

  // Remove a player
  public removePlayerWebSocket = (playerId: string) => {
    if (playerId in this.subscribedWebSockets) {
      this.subscribedWebSockets[playerId].close();
      delete this.subscribedWebSockets[playerId];
    }
  };

  // End a game
  public endGame = () => {
    // Send end game notification to all player
    const outgoingMessage: IGameEndMessage = { type: "gameEnd" };
    this.sendMessageToAllInGame(outgoingMessage);

    // Close all sockets and delete them
    Object.values(this.subscribedWebSockets).forEach((ws) => {
      ws.close();
    });

    // Delete the game
    this.deleteInstance();
  };

  private pushEvent = (event: GameEvent) => {
    // Add event
    this.events.push(event);

    // Calculate next state
    this.gameState = calculateGameState([event], this.gameState);

    // Construct message and sent to all players
    const outgoingMessage: INewEventMessage = { type: "newEvent", event };
    this.sendMessageToAllInGame(outgoingMessage);
  };

  // Send a message to all listening websockets
  private sendMessageToAllInGame = (outgoingMessage: OutgoingMessage) => {
    Object.values(this.subscribedWebSockets).forEach((ws) => {
      ws.send(JSON.stringify(outgoingMessage));
    });
  };
}
