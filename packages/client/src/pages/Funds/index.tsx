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
  const [showColorPicker, setShowColorPicker] = useState(false);

  const [showSendMoneyModal, hideSendMoneyModal] = useModal(
    () => (
      <>
        {recipient !== null && (
          <SendMoneyModal
            balance={me?.balance ?? 0}
            playerId={playerId}
            gameId={gameId}
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

  const otherPlayers = sortPlayersByName(players.filter((p) => p.playerId !== playerId));

  return (
    <div className="funds">
      {/* Game code button */}
      {isGameOpen && <GameCode gameId={gameId} isBanker={isBanker} />}

      {/* Bank & Free Parking */}
      <div className="mb-2 balance-grid">
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

      {/* Current user card */}
      {me !== undefined && (
        <Card className="mb-2 user-card">
          <Card.Body className="p-3 text-center">
            <div
              className="d-flex align-items-center justify-content-center gap-2"
              style={{ cursor: "pointer" }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              {me.color ? (
                <span
                  className="color-dot-lg"
                  style={{ backgroundColor: me.color }}
                  title="Click to change color"
                />
              ) : (
                <span className="color-dot-lg empty" title="Click to pick a color" />
              )}
              <div>
                <div className="font-weight-bold" style={{ fontSize: "1.1rem" }}>
                  {me.name}
                </div>
                <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>
                  {formatCurrency(me.balance)}
                </div>
              </div>
            </div>

            {/* Color picker popup */}
            {showColorPicker && (
              <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--hr-border)" }}>
                <div className="small text-muted mb-2">Pick Your Color</div>
                <div className="d-flex justify-content-center flex-wrap gap-2">
                  {PRESET_PLAYER_COLORS.map((c) => {
                    const isTaken = takenColors.includes(c);
                    const isMine = me.color === c;
                    return (
                      <button
                        key={c}
                        onClick={() => {
                          if (!isTaken) {
                            proposePlayerColorChange(playerId, c);
                            setShowColorPicker(false);
                          }
                        }}
                        disabled={isTaken}
                        style={{
                          width: 36,
                          height: 36,
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
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Other players */}
      <div className="mb-2">
        <div className="small text-muted mb-1 px-1">Players</div>
        <div className="balance-grid">
          {otherPlayers.map((player) => (
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
      </div>

      <div className="mt-2">
        <RecentTransactions events={events} players={players} />
      </div>
    </div>
  );
};

export default Funds;
