import Game, { BANKER_HOST_PLAYER_ID } from "./Game";
import { createUniqueGameId } from "./utils";

class GameStore {
  private games: Record<string, Game> = {};

  public createGame(
    initialBankersName: string,
    role: "player" | "banker" = "player",
    startingBalance?: number,
    passGoAmount?: number
  ) {
    // Generate a game id
    const gameId = createUniqueGameId(Object.keys(this.games));

    // Create the game
    const deleteInstance = () => this.deleteGame(gameId);
    this.games[gameId] = new Game(deleteInstance);

    // Add the user that created this game and set them as a banker
    const game = this.games[gameId];

    // Inject fake players & transactions for testing (only if enabled in env)
    game.injectFakeData();

    // Apply initial settings so that any subsequently added players use the configured defaults.
    // The game host (banker-host id) is treated as the actor for these initial setup events.
    game.configureInitialSettings(startingBalance, passGoAmount, BANKER_HOST_PLAYER_ID);

    if (role === "banker") {
      // Banker-only host: no player account, just an admin token
      const { userToken, playerId } = game.addBankerHost();
      return { gameId, userToken, playerId };
    }

    const { userToken, playerId } = game.addPlayer(initialBankersName);
    game.setPlayerBankerStatus(playerId, true, playerId);

    // Return the new game id and the users userToken
    return { gameId, userToken, playerId };
  }

  public doesGameExist(gameId: string) {
    return gameId in this.games;
  }

  public getGame(gameId: string) {
    return this.games[gameId];
  }

  public deleteGame(gameId: string) {
    delete this.games[gameId];
  }
}

export default new GameStore();
