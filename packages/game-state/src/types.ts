export type PlayerId = string;
export type GameEntity = "bank" | "freeParking" | PlayerId;

// Game state

export interface IGameStatePlayer {
  playerId: PlayerId;
  name: string;
  color: string;
  banker: boolean;
  balance: number;
  connected: boolean;
}

export interface IGameState {
  players: IGameStatePlayer[];
  useFreeParking: boolean;
  showOppositionBalances: boolean;
  freeParkingBalance: number;
  startingBalance: number;
  passGoAmount: number;
  open: boolean;
  undoneTransactions: string[];
}

// Game events

export type GameEvent =
  | IPlayerJoinEvent
  | IPlayerDeleteEvent
  | IPlayerNameChangeEvent
  | IPlayerColorChangeEvent
  | IPlayerBankerStatusChangeEvent
  | ITransactionEvent
  | ITransactionUndoEvent
  | IGameOpenStateChangeEvent
  | IUseFreeParkingChangeEvent
  | IShowOppositionBalancesChangeEvent
  | IStartingBalanceChangeEvent
  | IPassGoAmountChangeEvent
  | IPlayerConnectionChangeEvent;

export interface IGameEvent {
  time: string; // ISO string
  actionedBy: PlayerId;
}

export interface IPlayerJoinEvent extends IGameEvent {
  type: "playerJoin";
  playerId: PlayerId;
  name: string;
  color?: string;
}

export interface IPlayerDeleteEvent extends IGameEvent {
  type: "playerDelete";
  playerId: PlayerId;
}

export interface IPlayerNameChangeEvent extends IGameEvent {
  type: "playerNameChange";
  playerId: PlayerId;
  name: string;
}

export interface IPlayerColorChangeEvent extends IGameEvent {
  type: "playerColorChange";
  playerId: PlayerId;
  color: string;
}

export interface IPlayerBankerStatusChangeEvent extends IGameEvent {
  type: "playerBankerStatusChange";
  playerId: PlayerId;
  isBanker: boolean;
}

export interface ITransactionEvent extends IGameEvent {
  type: "transaction";
  from: GameEntity;
  to: GameEntity;
  amount: number;
}

export interface ITransactionUndoEvent extends IGameEvent {
  type: "transactionUndo";
  originalTime: string;
  from: GameEntity;
  to: GameEntity;
  amount: number;
}

export interface IGameOpenStateChangeEvent extends IGameEvent {
  type: "gameOpenStateChange";
  open: boolean;
}

export interface IUseFreeParkingChangeEvent extends IGameEvent {
  type: "useFreeParkingChange";
  useFreeParking: boolean;
}

export interface IShowOppositionBalancesChangeEvent extends IGameEvent {
  type: "showOppositionBalancesChange";
  showOppositionBalances: boolean;
}

export interface IStartingBalanceChangeEvent extends IGameEvent {
  type: "startingBalanceChange";
  startingBalance: number;
}

export interface IPassGoAmountChangeEvent extends IGameEvent {
  type: "passGoAmountChange";
  passGoAmount: number;
}

export interface IPlayerConnectionChangeEvent extends IGameEvent {
  type: "playerConnectionChange";
  playerId: PlayerId;
  connected: boolean;
}
