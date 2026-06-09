import { GameEntity, GameEvent, IGameStatePlayer, ITransactionEvent } from "@monopoly-money/game-state";
import { DateTime } from "luxon";
import React from "react";
import { bankName, freeParkingName } from "../../constants";
import { formatCurrency } from "../../utils";

const MAX_ENTRIES = 25;

interface IRecentTransactionsProps {
  events: GameEvent[];
  players: IGameStatePlayer[];
}

const RecentTransactions: React.FC<IRecentTransactionsProps> = ({ events, players }) => {
  const getEntityName = (entity: GameEntity) => {
    if (entity === "freeParking") return freeParkingName;
    if (entity === "bank") return bankName;
    return players.find((p) => p.playerId === entity)?.name ?? "[Deleted User]";
  };

  const transactions = events
    .filter((e): e is ITransactionEvent => e.type === "transaction")
    .slice(-MAX_ENTRIES)
    .reverse();

  const getTimeAgo = (time: string): string => {
    const seconds = Math.floor(-DateTime.fromISO(time).diffNow().as("seconds"));
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className="recent-transactions text-center mt-2">
      {transactions.length === 0 && (
        <small style={{ color: "var(--text-muted)" }}>No recent transactions</small>
      )}
      {transactions.map((t) => (
        <small key={t.time} className="d-block">
          {getEntityName(t.from)} → {getEntityName(t.to)} ({formatCurrency(t.amount)}){" "}
          <span style={{ color: "var(--text-muted)", opacity: 0.7 }}>{getTimeAgo(t.time)}</span>
        </small>
      ))}
    </div>
  );
};

export default RecentTransactions;
