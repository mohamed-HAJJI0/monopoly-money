import {
  GameEntity,
  GameEvent,
  IGameStatePlayer,
  ITransactionEvent
} from "@monopoly-money/game-state";
import React from "react";
import { bankName, freeParkingName } from "../../constants";
import { formatCurrency } from "../../utils";

const MAX_TRANSACTION_LINES = 25;

interface IRecentTransactionsProps {
  events: GameEvent[];
  players: IGameStatePlayer[];
}

const RecentTransactions: React.FC<IRecentTransactionsProps> = ({ events, players }) => {
  const getEntityName = (entity: GameEntity) => {
    if (entity === "freeParking") {
      return freeParkingName;
    } else if (entity === "bank") {
      return bankName;
    } else {
      const player = players.find((p) => p.playerId === entity);
      return player?.name ?? "[Deleted User]";
    }
  };

  // Get all transactions, keep last MAX_TRANSACTION_LINES, reverse so newest is on top
  const transactions = events
    .filter((e): e is ITransactionEvent => e.type === "transaction")
    .slice(-MAX_TRANSACTION_LINES)
    .reverse();

  return (
    <div className="recent-transactions text-center">
      {transactions.map((t) => (
        <small key={t.time} className="d-block">
          {getEntityName(t.from)} → {getEntityName(t.to)} ({formatCurrency(t.amount)})
        </small>
      ))}
    </div>
  );
};

export default RecentTransactions;
