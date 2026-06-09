import {
  calculateGameState,
  defaultGameState,
  GameEntity,
  GameEvent,
  IGameState
} from "@monopoly-money/game-state";
import { DateTime } from "luxon";
import React from "react";
import { Button } from "react-bootstrap";
import { bankName, freeParkingName } from "../../constants";
import { formatCurrency } from "../../utils";
import "./History.scss";

interface IHistoryProps {
  events: GameEvent[];
  role: "player" | "banker";
  isBanker: boolean;
  proposeTransactionUndo: (originalTime: string, from: GameEntity, to: GameEntity, amount: number) => void;
}

const BANKER_HOST_PLAYER_ID = "banker-host";

const History: React.FC<IHistoryProps> = ({ events, isBanker, proposeTransactionUndo }) => {
  let currentGameState = defaultGameState;
  const details = events.map((event) => {
    const nextState = calculateGameState([event], currentGameState);
    const currentEventDetails = getEventDetails(event, currentGameState, nextState);
    currentGameState = nextState;
    return currentEventDetails;
  });

  return (
    <div className="history">
      {details.reverse().map((eventDetail) =>
        eventDetail === null ? null : (
          <div
            key={eventDetail.id}
            className={`event mb-2 ${eventDetail.isUndone ? "undone" : ""}`}
          >
            <div className="bar" style={{ background: `var(--${eventDetail.colour})` }} />
            <div className="event-details">
              <div className="top">
                <small>{eventDetail.title}</small>
                <small>
                  {eventDetail.actionedBy !== null && (
                    <span className="mr-2">(✍️ {eventDetail.actionedBy})</span>
                  )}
                  {eventDetail.time}
                </small>
              </div>
              <div className="detail">
                <span style={eventDetail.isUndone ? { textDecoration: "line-through", opacity: 0.6 } : {}}>
                  {eventDetail.detail}
                </span>
                {eventDetail.isTransaction && !eventDetail.isUndone && isBanker && eventDetail.originalTime && eventDetail.from !== undefined && eventDetail.to !== undefined && eventDetail.amount !== undefined && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="ml-2 py-0 px-1"
                    style={{ fontSize: "0.7rem", lineHeight: 1.2 }}
                    onClick={() => proposeTransactionUndo(eventDetail.originalTime!, eventDetail.from!, eventDetail.to!, eventDetail.amount!)}
                  >
                    ↩ Undo
                  </Button>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

interface IEventDetail {
  id: string;
  title: string;
  actionedBy: string | null;
  time: string;
  detail: string;
  colour: "blue" | "red" | "orange" | "yellow" | "green" | "cyan";
  isTransaction: boolean;
  isUndone: boolean;
  originalTime?: string;
  from?: GameEntity;
  to?: GameEntity;
  amount?: number;
}

const getEventDetails = (
  event: GameEvent,
  previousState: IGameState,
  nextState: IGameState
): IEventDetail | null => {
  const getPlayerName = (playerId: string, state: IGameState = nextState): string | null => {
    if (playerId === BANKER_HOST_PLAYER_ID) {
      return "Bank Manager";
    }
    const player = state.players.find((p) => p.playerId === playerId);
    return player?.name ?? null;
  };

  const defaults = {
    id: `${event.type + event.time}`,
    time: DateTime.fromISO(event.time).toFormat("h:mm a")
  };
  switch (event.type) {
    case "playerJoin": {
      const player = nextState.players.find((p) => p.playerId === event.playerId)!;
      return {
        ...defaults,
        title: "Player Join",
        actionedBy: null,
        detail: `${player.name} joined`,
        colour: "cyan",
        isTransaction: false,
        isUndone: false
      };
    }

    case "playerBankerStatusChange": {
      const player = nextState.players.find((p) => p.playerId === event.playerId)!;
      const actionedBy = getPlayerName(event.actionedBy, previousState);
      return {
        ...defaults,
        title: "Player Banker Status Change",
        actionedBy,
        detail: `${player.name} was made a banker`,
        colour: "yellow",
        isTransaction: false,
        isUndone: false
      };
    }

    case "transaction": {
      const playerReceiving =
        event.to === "bank"
          ? bankName
          : event.to === "freeParking"
            ? freeParkingName
            : nextState.players.find((p) => p.playerId === event.to)!.name;
      const playerGiving =
        event.from === "bank"
          ? bankName
          : event.from === "freeParking"
            ? freeParkingName
            : nextState.players.find((p) => p.playerId === event.from)!.name;
      const actionedBy = getPlayerName(event.actionedBy, previousState);
      const fromPlayerId = event.actionedBy;
      const isUndone = nextState.undoneTransactions.includes(event.time);
      return {
        ...defaults,
        title: `Transaction`,
        actionedBy: fromPlayerId === event.from ? null : actionedBy,
        detail: `${playerGiving} → ${playerReceiving} (${formatCurrency(event.amount)})`,
        colour: isUndone ? "red" : "green",
        isTransaction: true,
        isUndone,
        originalTime: event.time,
        from: event.from,
        to: event.to,
        amount: event.amount
      };
    }

    case "transactionUndo": {
      const playerReceiving =
        event.to === "bank"
          ? bankName
          : event.to === "freeParking"
            ? freeParkingName
            : nextState.players.find((p) => p.playerId === event.to)!.name;
      const playerGiving =
        event.from === "bank"
          ? bankName
          : event.from === "freeParking"
            ? freeParkingName
            : nextState.players.find((p) => p.playerId === event.from)!.name;
      const actionedBy = getPlayerName(event.actionedBy, previousState);
      return {
        ...defaults,
        title: "Transaction Undo",
        actionedBy,
        detail: `↩ Undone: ${playerGiving} → ${playerReceiving} (${formatCurrency(event.amount)})`,
        colour: "red",
        isTransaction: false,
        isUndone: false
      };
    }

    case "playerNameChange": {
      const playerNameBeforeRename = previousState.players.find(
        (p) => p.playerId === event.playerId
      )!.name;
      const playerNameAfterRename = nextState.players.find(
        (p) => p.playerId === event.playerId
      )!.name;
      const actionedBy = getPlayerName(event.actionedBy, previousState);
      return {
        ...defaults,
        title: "Player Name Change",
        actionedBy: event.actionedBy === event.playerId ? null : actionedBy,
        detail: `${playerNameBeforeRename} was renamed to ${playerNameAfterRename}`,
        colour: "orange",
        isTransaction: false,
        isUndone: false
      };
    }

    case "playerDelete": {
      const playerName = previousState.players.find((p) => p.playerId === event.playerId)!.name;
      const actionedBy = getPlayerName(event.actionedBy, previousState);
      return {
        ...defaults,
        title: "Player Removal",
        actionedBy: event.actionedBy === event.playerId ? null : actionedBy,
        detail: `${playerName} was removed from the game`,
        colour: "red",
        isTransaction: false,
        isUndone: false
      };
    }

    case "gameOpenStateChange": {
      const actionedBy = getPlayerName(event.actionedBy, previousState);
      return {
        ...defaults,
        title: "Game Open State Change",
        actionedBy,
        detail: `The game is now ${event.open ? "open" : "closed"} to new players`,
        colour: "blue",
        isTransaction: false,
        isUndone: false
      };
    }

    case "useFreeParkingChange": {
      const actionedBy = getPlayerName(event.actionedBy, previousState);
      return {
        ...defaults,
        title: "Use Free Parking State Change",
        actionedBy,
        detail: `The Free Parking house rule is now ${
          event.useFreeParking ? "enabled" : "disabled"
        }`,
        colour: "blue",
        isTransaction: false,
        isUndone: false
      };
    }

    case "showOppositionBalancesChange": {
      const actionedBy = getPlayerName(event.actionedBy, previousState);
      return {
        ...defaults,
        title: "Show Opposition Balances State Change",
        actionedBy,
        detail: `Opposition balances are now ${event.showOppositionBalances ? "shown" : "hidden"}`,
        colour: "blue",
        isTransaction: false,
        isUndone: false
      };
    }

    case "startingBalanceChange": {
      const actionedBy = getPlayerName(event.actionedBy, previousState);
      return {
        ...defaults,
        title: "Starting Balance Changed",
        actionedBy,
        detail: `Starting balance set to ${formatCurrency(event.startingBalance)}`,
        colour: "blue",
        isTransaction: false,
        isUndone: false
      };
    }

    case "passGoAmountChange": {
      const actionedBy = getPlayerName(event.actionedBy, previousState);
      return {
        ...defaults,
        title: "Pass GO Amount Changed",
        actionedBy,
        detail: `Pass GO amount set to ${formatCurrency(event.passGoAmount)}`,
        colour: "blue",
        isTransaction: false,
        isUndone: false
      };
    }

    case "playerColorChange": {
      const player = nextState.players.find((p) => p.playerId === event.playerId)!;
      const actionedBy = getPlayerName(event.actionedBy, previousState);
      return {
        ...defaults,
        title: "Player Color Changed",
        actionedBy,
        detail: `${player.name} changed to ${event.color}`,
        colour: "cyan",
        isTransaction: false,
        isUndone: false
      };
    }

    case "playerConnectionChange": {
      // Don't show these as they will pollute the history
      return null;
    }
  }

  return null;
};

export default History;
