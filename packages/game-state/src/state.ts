import { GameEvent, IGameState } from "./types";

export const PRESET_PLAYER_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#d946ef",
  "#f43f5e",
  "#14b8a6",
  "#84cc16",
  "#f59e0b"
];

const getDefaultColor = (playerCount: number): string =>
  PRESET_PLAYER_COLORS[playerCount % PRESET_PLAYER_COLORS.length];

export const defaultGameState: IGameState = {
  players: [],
  useFreeParking: true,
  showOppositionBalances: true,
  freeParkingBalance: 0,
  startingBalance: 1500,
  passGoAmount: 200,
  open: true,
  undoneTransactions: []
};

export const calculateGameState = (events: GameEvent[], currentState: IGameState): IGameState => {
  return events.reduce((state: IGameState, event: GameEvent) => {
    switch (event.type) {
      case "playerJoin":
        return {
          ...state,
          players: [
            ...state.players,
            {
              playerId: event.playerId,
              name: event.name,
              color: event.color || getDefaultColor(state.players.length),
              banker: false,
              balance: state.startingBalance,
              connected: false
            }
          ]
        };

      case "playerDelete":
        return {
          ...state,
          players: state.players.filter((p) => p.playerId !== event.playerId)
        };

      case "playerNameChange":
        return {
          ...state,
          players: state.players.map((p) =>
            p.playerId === event.playerId
              ? {
                  ...p,
                  name: event.name
                }
              : p
          )
        };

      case "playerColorChange":
        return {
          ...state,
          players: state.players.map((p) =>
            p.playerId === event.playerId
              ? {
                  ...p,
                  color: event.color
                }
              : p
          )
        };

      case "playerBankerStatusChange":
        return {
          ...state,
          players: state.players.map((p) =>
            p.playerId === event.playerId
              ? {
                  ...p,
                  banker: event.isBanker
                }
              : p
          )
        };

      case "transaction":
        if (event.from === "bank" || event.from === "freeParking") {
          const destinationPlayer = state.players.find((p) => p.playerId === event.to);
          if (destinationPlayer === undefined) {
            throw new Error("Unable to find destination player");
          }
          return {
            ...state,
            players: [
              ...state.players.filter((p) => p.playerId !== event.from && p.playerId !== event.to),
              {
                ...destinationPlayer,
                balance: destinationPlayer.balance + event.amount
              }
            ],
            freeParkingBalance:
              event.from === "freeParking"
                ? state.freeParkingBalance - event.amount
                : state.freeParkingBalance
          };
        } else if (event.to === "bank" || event.to === "freeParking") {
          const sourcePlayer = state.players.find((p) => p.playerId === event.from);
          if (sourcePlayer === undefined) {
            throw new Error("Unable to find source player");
          }
          return {
            ...state,
            players: [
              ...state.players.filter((p) => p.playerId !== event.from && p.playerId !== event.to),
              {
                ...sourcePlayer,
                balance: sourcePlayer.balance - event.amount
              }
            ],
            freeParkingBalance:
              event.to === "freeParking"
                ? state.freeParkingBalance + event.amount
                : state.freeParkingBalance
          };
        } else {
          const sourcePlayer = state.players.find((p) => p.playerId === event.from);
          const destinationPlayer = state.players.find((p) => p.playerId === event.to);
          if (sourcePlayer === undefined || destinationPlayer === undefined) {
            throw new Error("Unable to find source or destination player");
          }
          return {
            ...state,
            players: [
              ...state.players.filter((p) => p.playerId !== event.from && p.playerId !== event.to),
              {
                ...sourcePlayer,
                balance: sourcePlayer.balance - event.amount
              },
              {
                ...destinationPlayer,
                balance: destinationPlayer.balance + event.amount
              }
            ]
          };
        }
      case "transactionUndo": {
        // Mark the original transaction as undone
        const undoneTransactions = [...state.undoneTransactions, event.originalTime];
        // Apply the reverse transaction (swap from/to)
        const reverseFrom = event.to;
        const reverseTo = event.from;
        if (reverseFrom === "bank" || reverseFrom === "freeParking") {
          const destinationPlayer = state.players.find((p) => p.playerId === reverseTo);
          if (destinationPlayer === undefined) {
            throw new Error("Unable to find destination player for undo");
          }
          return {
            ...state,
            undoneTransactions,
            players: [
              ...state.players.filter((p) => p.playerId !== reverseFrom && p.playerId !== reverseTo),
              {
                ...destinationPlayer,
                balance: destinationPlayer.balance + event.amount
              }
            ],
            freeParkingBalance:
              reverseFrom === "freeParking"
                ? state.freeParkingBalance - event.amount
                : state.freeParkingBalance
          };
        } else if (reverseTo === "bank" || reverseTo === "freeParking") {
          const sourcePlayer = state.players.find((p) => p.playerId === reverseFrom);
          if (sourcePlayer === undefined) {
            throw new Error("Unable to find source player for undo");
          }
          return {
            ...state,
            undoneTransactions,
            players: [
              ...state.players.filter((p) => p.playerId !== reverseFrom && p.playerId !== reverseTo),
              {
                ...sourcePlayer,
                balance: sourcePlayer.balance - event.amount
              }
            ],
            freeParkingBalance:
              reverseTo === "freeParking"
                ? state.freeParkingBalance + event.amount
                : state.freeParkingBalance
          };
        } else {
          const sourcePlayer = state.players.find((p) => p.playerId === reverseFrom);
          const destinationPlayer = state.players.find((p) => p.playerId === reverseTo);
          if (sourcePlayer === undefined || destinationPlayer === undefined) {
            throw new Error("Unable to find source or destination player for undo");
          }
          return {
            ...state,
            undoneTransactions,
            players: [
              ...state.players.filter((p) => p.playerId !== reverseFrom && p.playerId !== reverseTo),
              {
                ...sourcePlayer,
                balance: sourcePlayer.balance - event.amount
              },
              {
                ...destinationPlayer,
                balance: destinationPlayer.balance + event.amount
              }
            ]
          };
        }
      }
      case "gameOpenStateChange":
        return {
          ...state,
          open: event.open
        };

      case "useFreeParkingChange":
        return {
          ...state,
          useFreeParking: event.useFreeParking
        };

      case "showOppositionBalancesChange":
        return {
          ...state,
          showOppositionBalances: event.showOppositionBalances
        };

      case "startingBalanceChange":
        return {
          ...state,
          startingBalance: event.startingBalance
        };

      case "passGoAmountChange":
        return {
          ...state,
          passGoAmount: event.passGoAmount
        };

      case "playerConnectionChange":
        return {
          ...state,
          players: [
            ...state.players.filter((p) => p.playerId !== event.playerId),
            {
              ...state.players.find((p) => p.playerId === event.playerId)!,
              connected: event.connected
            }
          ]
        };
    }
  }, currentState);
};
