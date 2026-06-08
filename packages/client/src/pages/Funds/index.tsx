import { GameEntity, GameEvent, IGameStatePlayer, PRESET_PLAYER_COLORS } from "@monopoly-money/game-state";
import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { useModal } from "react-modal-hook";
import { bankName, freeParkingName } from "../../constants";
import { formatCurrency, sortPlayersByName } from "../../utils";
import "./Funds.scss";
import GameCode from "./GameCode";
import PlayerCard from "./PlayerCard";
import RecentTransactions from "./RecentTransactions";
import SendMoneyModal from "./SendMoneyModal";

interface IFundsProps {
  gameId: string;
  playerId: string;
  isGameOpen: boolean;
  players: IGameStatePlayer[];
  useFreeParking: boolean;
  showOppositionBalances: boolean;
  freeParkingBalance: number;
  proposeTransaction: (from: GameEntity, to: GameEntity, amount: number) => void;
  proposePlayerColorChange: (playerId: string, color: string) => void;
  events: GameEvent[];
}

const Funds: React.FC<IFundsProps> = ({
  gameId,
  playerId,
  isGameOpen,
  players,
  useFreeParking,
  freeParkingBalance,
  showOppositionBalances,
  proposeTransaction,
  proposePlayerColorChange,
  events
}) => {
  const [recipient, setRecipient] = useState<IGameStatePlayer | "freeParking" | "bank" | null>(
    null
  );
  const [showSendMoneyModal, hideSendMoneyModal] = useModal(
    () => (
      <>
        {recipient !== null && (
          <SendMoneyModal
            balance={me?.balance ?? 0}
            playerId={playerId}
            recipient={recipient}
            proposeTransaction={proposeTransaction}
            onClose={() => setRecipient(null)}
          />
        )}
      </>
    ),
    [recipient]
  );

  // Show/hide the send money modal automatically
  useEffect(() => {
    if (recipient !== null) {
      showSendMoneyModal();
    } else {
      hideSendMoneyModal();
    }
  }, [recipient, showSendMoneyModal, hideSendMoneyModal]);

  const me = players.find((p) => p.playerId === playerId);
  const isBanker = me?.banker ?? false;

  const takenColors = players
    .filter((p) => p.playerId !== playerId && p.color)
    .map((p) => p.color!);

  return (
    <div className="funds">
      {isGameOpen && <GameCode gameId={gameId} isBanker={isBanker} />}

      <Card className="mb-1 text-center">
        {me !== undefined && (
          <Card.Body className="p-3">
            <div className="d-flex align-items-center justify-content-center gap-2">
              {me.color && (
                <span
                  className="color-dot"
                  style={{ backgroundColor: me.color }}
                />
              )}
              <span>
                {me.name}: {formatCurrency(me.balance)}
              </span>
            </div>
          </Card.Body>
        )}
      </Card>

      {/* Color picker */}
      {me !== undefined && (
        <Card className="mb-2 text-center">
          <Card.Body className="p-2">
            <div className="small text-muted mb-1">
              {me.color ? "Your Color" : "Pick Your Color"}
            </div>
            <div className="d-flex justify-content-center flex-wrap gap-1">
              {PRESET_PLAYER_COLORS.map((c) => {
                const isTaken = takenColors.includes(c);
                const isMine = me.color === c;
                return (
                  <button
                    key={c}
                    onClick={() => !isTaken && proposePlayerColorChange(playerId, c)}
                    disabled={isTaken}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      backgroundColor: c,
                      border: isMine ? "3px solid #000" : "2px solid transparent",
                      cursor: isTaken ? "not-allowed" : "pointer",
                      opacity: isTaken ? 0.3 : 1,
                      boxShadow: isMine ? "0 0 0 2px #fff, 0 0 0 4px " + c : "none"
                    }}
                    aria-label={isTaken ? `Color ${c} taken` : `Select color ${c}`}
                  />
                );
              })}
            </div>
          </Card.Body>
        </Card>
      )}

      <div className="mb-1 balance-grid">
        {sortPlayersByName(players.filter((p) => p.playerId !== playerId)).map((player) => (
          <PlayerCard
            key={player.playerId}
            name={player.name}
            color={player.color}
            connected={player.connected}
            balance={showOppositionBalances ? player.balance : null}
            onClick={() => setRecipient(player)}
          />
        ))}
      </div>

      <div className="balance-grid">
        {useFreeParking && (
          <PlayerCard
            name={freeParkingName}
            color={null}
            connected={null}
            balance={freeParkingBalance}
            onClick={() => setRecipient("freeParking")}
          />
        )}
        <PlayerCard
          name={bankName}
          color={null}
          connected={null}
          balance={Number.POSITIVE_INFINITY}
          onClick={() => setRecipient("bank")}
        />
      </div>

      <div className="mt-2">
        <RecentTransactions events={events} players={players} />
      </div>
    </div>
  );
};

export default Funds;
