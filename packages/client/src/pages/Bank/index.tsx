import { GameEntity, GameEvent, IGameStatePlayer, PRESET_PLAYER_COLORS } from "@monopoly-money/game-state";
import React, { useEffect, useRef, useState } from "react";
import { Button, ButtonGroup, Card, Form } from "react-bootstrap";
import { DateTime } from "luxon";
import { formatCurrency } from "../../utils";
import "./Bank.scss";
import SendMoneyModal from "./SendMoneyModal";

interface IBankProps {
  players: IGameStatePlayer[];
  useFreeParking: boolean;
  freeParkingBalance: number;
  startingBalance: number;
  passGoAmount: number;
  hasATransactionBeenMade: boolean;
  events: GameEvent[];
  undoneTransactions: string[];
  proposeTransaction: (from: GameEntity, to: GameEntity, amount: number) => void;
  proposeTransactionUndo: (originalTime: string, from: GameEntity, to: GameEntity, amount: number) => void;
  proposePlayerColorChange: (playerId: string, color: string) => void;
}

type LayoutMode = "column" | "grid";
type ButtonSize = "sm" | "lg";

const PRESET_DEDUCTIONS = [100, 50, 25];

const Bank: React.FC<IBankProps> = ({
  players,
  useFreeParking,
  freeParkingBalance,
  startingBalance,
  passGoAmount,
  hasATransactionBeenMade,
  events,
  undoneTransactions,
  proposeTransaction,
  proposeTransactionUndo,
  proposePlayerColorChange
}) => {
  const [layout, setLayout] = useState<LayoutMode>("column");
  const [buttonSize, setButtonSize] = useState<ButtonSize>("sm");
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [sendModalPlayer, setSendModalPlayer] = useState<IGameStatePlayer | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const logMessagesRef = useRef<HTMLDivElement>(null);

  // Scroll log to bottom on new events, but only if user is already near the bottom
  useEffect(() => {
    const container = logMessagesRef.current;
    if (!container || !logEndRef.current) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 80;
    if (isNearBottom) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [events]);

  const handlePassGo = (playerId: string) => {
    proposeTransaction("bank", playerId, passGoAmount);
  };

  const handleDeduction = (playerId: string, amount: number) => {
    proposeTransaction(playerId, "bank", amount);
  };

  const handleCustomGive = (playerId: string) => {
    const amt = parseInt(customInputs[playerId] || "", 10);
    if (amt > 0) {
      proposeTransaction("bank", playerId, amt);
      setCustomInputs((prev) => ({ ...prev, [playerId]: "" }));
    }
  };

  const handleCustomTake = (playerId: string) => {
    const amt = parseInt(customInputs[playerId] || "", 10);
    if (amt > 0) {
      proposeTransaction(playerId, "bank", amt);
      setCustomInputs((prev) => ({ ...prev, [playerId]: "" }));
    }
  };

  const handleInitialize = () => {
    players.forEach((player) => {
      const diff = startingBalance - player.balance;
      if (diff > 0) {
        proposeTransaction("bank", player.playerId, diff);
      } else if (diff < 0) {
        proposeTransaction(player.playerId, "bank", Math.abs(diff));
      }
    });
  };

  const handleSendMoney = (recipientId: string, amount: number) => {
    if (sendModalPlayer) {
      proposeTransaction(sendModalPlayer.playerId, recipientId, amount);
      setSendModalPlayer(null);
    }
  };

  const getLogEntry = (event: GameEvent): {
    text: React.ReactNode;
    badge?: string;
    badgeClass?: string;
    icon: string;
    color?: string;
    isTransaction: boolean;
    originalTime?: string;
    from?: GameEntity;
    to?: GameEntity;
    amount?: number;
    isUndone: boolean;
  } | null => {
    const time = DateTime.fromISO(event.time).toFormat("h:mm a");
    switch (event.type) {
      case "transaction": {
        const fromName =
          event.from === "bank" ? "Bank" : event.from === "freeParking" ? "Free Parking" : players.find((p) => p.playerId === event.from)?.name ?? "?";
        const toName =
          event.to === "bank" ? "Bank" : event.to === "freeParking" ? "Free Parking" : players.find((p) => p.playerId === event.to)?.name ?? "?";
        const fromPlayer = players.find((p) => p.playerId === event.from);
        const isUndone = undoneTransactions.includes(event.time);
        return {
          icon: "💸",
          badge: time,
          badgeClass: "transaction",
          text: (
            <span className={isUndone ? "log-text-strike" : undefined}>
              <strong>{fromName}</strong>
              <span className="log-arrow"> → </span>
              <strong>{toName}</strong>
              <span className="log-amount"> {formatCurrency(event.amount)}</span>
            </span>
          ),
          color: fromPlayer?.color,
          isTransaction: true,
          originalTime: event.time,
          from: event.from,
          to: event.to,
          amount: event.amount,
          isUndone
        };
      }
      case "transactionUndo": {
        const fromName =
          event.from === "bank" ? "Bank" : event.from === "freeParking" ? "Free Parking" : players.find((p) => p.playerId === event.from)?.name ?? "?";
        const toName =
          event.to === "bank" ? "Bank" : event.to === "freeParking" ? "Free Parking" : players.find((p) => p.playerId === event.to)?.name ?? "?";
        return {
          icon: "↩",
          badge: time,
          badgeClass: "undo",
          text: (
            <span>
              Undo: <strong>{fromName}</strong>
              <span className="log-arrow"> → </span>
              <strong>{toName}</strong>
              <span className="log-amount"> {formatCurrency(event.amount)}</span>
            </span>
          ),
          color: "#9e9e9e",
          isTransaction: false,
          isUndone: false
        };
      }
      case "playerJoin":
        return {
          icon: "👤",
          badge: time,
          badgeClass: "info",
          text: <span><strong>{event.name}</strong> joined the game</span>,
          color: event.color,
          isTransaction: false,
          isUndone: false
        };
      case "playerDelete": {
        const name = players.find((p) => p.playerId === event.playerId)?.name ?? "?";
        return {
          icon: "🗑",
          badge: time,
          badgeClass: "warning",
          text: <span><strong>{name}</strong> was removed</span>,
          isTransaction: false,
          isUndone: false
        };
      }
      case "playerNameChange": {
        const name = players.find((p) => p.playerId === event.playerId)?.name ?? "?";
        return {
          icon: "✏️",
          badge: time,
          badgeClass: "info",
          text: <span><strong>{name}</strong> changed their name</span>,
          isTransaction: false,
          isUndone: false
        };
      }
      case "playerColorChange": {
        const name = players.find((p) => p.playerId === event.playerId)?.name ?? "?";
        return {
          icon: "🎨",
          badge: time,
          badgeClass: "info",
          text: <span><strong>{name}</strong> changed color</span>,
          color: event.color,
          isTransaction: false,
          isUndone: false
        };
      }
      case "startingBalanceChange":
        return {
          icon: "🏦",
          badge: time,
          badgeClass: "settings",
          text: (
            <span>
              Starting balance set to <strong>{formatCurrency(event.startingBalance)}</strong>
            </span>
          ),
          isTransaction: false,
          isUndone: false
        };
      case "passGoAmountChange":
        return {
          icon: "🎲",
          badge: time,
          badgeClass: "settings",
          text: (
            <span>
              Pass GO set to <strong>{formatCurrency(event.passGoAmount)}</strong>
            </span>
          ),
          isTransaction: false,
          isUndone: false
        };
      case "playerBankerStatusChange": {
        const name = players.find((p) => p.playerId === event.playerId)?.name ?? "?";
        return {
          icon: "🎩",
          badge: time,
          badgeClass: "info",
          text: (
            <span>
              <strong>{name}</strong> {event.isBanker ? "was made a banker" : "is no longer a banker"}
            </span>
          ),
          isTransaction: false,
          isUndone: false
        };
      }
      case "gameOpenStateChange":
        return {
          icon: "🔓",
          badge: time,
          badgeClass: "settings",
          text: (
            <span>
              Game {event.open ? <strong>opened</strong> : <strong>closed</strong>} to new players
            </span>
          ),
          isTransaction: false,
          isUndone: false
        };
      case "useFreeParkingChange":
        return {
          icon: "🚗",
          badge: time,
          badgeClass: "settings",
          text: (
            <span>
              Free Parking house rule {event.useFreeParking ? <strong>enabled</strong> : <strong>disabled</strong>}
            </span>
          ),
          isTransaction: false,
          isUndone: false
        };
      case "showOppositionBalancesChange":
        return {
          icon: "👁",
          badge: time,
          badgeClass: "settings",
          text: (
            <span>
              Opposition balances {event.showOppositionBalances ? <strong>shown</strong> : <strong>hidden</strong>}
            </span>
          ),
          isTransaction: false,
          isUndone: false
        };
      case "playerConnectionChange":
        // Don't show connection events in the live bank log to reduce noise
        return null;
      default:
        return null;
    }
  };

  const logEntries = events
    .map((e) => getLogEntry(e))
    .filter((e): e is NonNullable<ReturnType<typeof getLogEntry>> => e !== null);

  const transactionCount = logEntries.filter((e) => e.isTransaction && !e.isUndone).length;
  const undoneCount = logEntries.filter((e) => e.isTransaction && e.isUndone).length;

  const renderPlayerCard = (player: IGameStatePlayer) => {
    const inputVal = customInputs[player.playerId] || "";
    const takenColors = players
      .filter((p) => p.playerId !== player.playerId && p.color)
      .map((p) => p.color!);

    return (
      <Card
        key={player.playerId}
        className={`player-card ${layout}`}
        style={{ borderLeft: `5px solid ${player.color ?? "#9e9e9e"}` }}
      >
        <Card.Body className="p-2">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="d-flex align-items-center">
              <div
                className="color-dot mr-2"
                style={{ backgroundColor: player.color ?? "#9e9e9e" }}
              />
              <strong>{player.name}</strong>
              {player.banker && <span className="ml-1 text-muted">(Banker)</span>}
            </div>
            <div className="font-weight-bold">{formatCurrency(player.balance)}</div>
          </div>

          <div className="color-picker mb-2">
            {PRESET_PLAYER_COLORS.map((c) => {
              const isTaken = takenColors.includes(c);
              const isCurrent = player.color === c;
              return (
                <button
                  key={c}
                  onClick={() => !isTaken && proposePlayerColorChange(player.playerId, c)}
                  disabled={isTaken}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    backgroundColor: c,
                    border: isCurrent ? "2px solid #000" : "1px solid transparent",
                    cursor: isTaken ? "not-allowed" : "pointer",
                    opacity: isTaken ? 0.3 : 1,
                    margin: 2
                  }}
                  aria-label={isTaken ? `Color ${c} taken` : `Change color to ${c}`}
                />
              );
            })}
          </div>

          <div className={`action-buttons ${buttonSize}`}>
            <Button
              variant="success"
              size={buttonSize}
              onClick={() => handlePassGo(player.playerId)}
              className="m-1"
            >
              Pass GO (+{formatCurrency(passGoAmount)})
            </Button>
            {PRESET_DEDUCTIONS.map((amt) => (
              <Button
                key={amt}
                variant="warning"
                size={buttonSize}
                onClick={() => handleDeduction(player.playerId, amt)}
                className="m-1"
              >
                -{formatCurrency(amt)}
              </Button>
            ))}
            <Button
              variant="info"
              size={buttonSize}
              onClick={() => setSendModalPlayer(player)}
              className="m-1"
            >
              Send
            </Button>
          </div>

          <div className={`custom-action mt-2 d-flex align-items-center gap-2 ${buttonSize}`}>
            <Form.Control
              type="number"
              placeholder="Amount"
              value={inputVal}
              onChange={(e) =>
                setCustomInputs((prev) => ({ ...prev, [player.playerId]: e.target.value }))
              }
              className="text-center"
              style={{ maxWidth: 100 }}
              size={buttonSize}
            />
            <Button
              variant="primary"
              size={buttonSize}
              onClick={() => handleCustomGive(player.playerId)}
              disabled={!inputVal || parseInt(inputVal, 10) <= 0}
            >
              Give
            </Button>
            <Button
              variant="danger"
              size={buttonSize}
              onClick={() => handleCustomTake(player.playerId)}
              disabled={!inputVal || parseInt(inputVal, 10) <= 0}
            >
              Take
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  return (
    <div className="bank-page">
      {/* Left panel: controls + players */}
      <div className="left-panel">
        <div className="controls-bar d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small">Layout:</span>
            <ButtonGroup size="sm">
              <Button
                variant={layout === "column" ? "primary" : "outline-primary"}
                onClick={() => setLayout("column")}
              >
                Column
              </Button>
              <Button
                variant={layout === "grid" ? "primary" : "outline-primary"}
                onClick={() => setLayout("grid")}
              >
                Grid
              </Button>
            </ButtonGroup>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small">Buttons:</span>
            <ButtonGroup size="sm">
              {(["sm", "lg"] as const).map((s) => (
                <Button
                  key={s}
                  variant={buttonSize === s ? "secondary" : "outline-secondary"}
                  onClick={() => setButtonSize(s)}
                >
                  {s.toUpperCase()}
                </Button>
              ))}
            </ButtonGroup>
          </div>
          {!hasATransactionBeenMade && (
            <Button variant="outline-primary" size="sm" onClick={handleInitialize}>
              Init All to {formatCurrency(startingBalance)}
            </Button>
          )}
        </div>

        <div className={`players-area ${layout}`}>
          {players.map(renderPlayerCard)}

          {useFreeParking && freeParkingBalance > 0 && (
            <Card className="free-parking-card">
              <Card.Body className="p-2 text-center">
                <strong>🚗 Free Parking:</strong> {formatCurrency(freeParkingBalance)}
              </Card.Body>
            </Card>
          )}
        </div>
      </div>

      {/* Right panel: transaction log */}
      <div className="right-panel">
        <div className="log-area">
          <div className="log-header d-flex justify-content-between align-items-center">
            <strong className="small">Transaction Log</strong>
            <div className="d-flex align-items-center gap-2">
              {transactionCount > 0 && (
                <span className="log-stat text-success small">{transactionCount} tx</span>
              )}
              {undoneCount > 0 && (
                <span className="log-stat text-muted small">{undoneCount} undone</span>
              )}
              <span className="text-muted small">{logEntries.length} events</span>
            </div>
          </div>
          <div className="log-messages" ref={logMessagesRef}>
            {logEntries.length === 0 ? (
              <div className="log-empty text-muted text-center small">
                <div className="log-empty-icon">📜</div>
                <div>No events yet.</div>
                <div className="log-empty-hint">
                  Transactions, player joins, and settings changes will appear here.
                </div>
              </div>
            ) : (
              logEntries.map((entry, idx) => (
                <div
                  key={idx}
                  className={`log-message ${entry.isUndone ? "undone" : ""} ${entry.isTransaction ? "is-transaction" : ""}`}
                  style={entry.color ? { borderLeftColor: entry.color } : undefined}
                >
                  <div className="log-message-inner">
                    <span className="log-icon" aria-hidden="true">
                      {entry.icon}
                    </span>
                    <div className="log-body">
                      <div className="log-meta">
                        {entry.badge && (
                          <span className={`log-badge ${entry.badgeClass ?? ""}`}>{entry.badge}</span>
                        )}
                      </div>
                      <div className="log-text">{entry.text}</div>
                    </div>
                    {entry.isTransaction && !entry.isUndone && entry.originalTime && entry.from !== undefined && entry.to !== undefined && entry.amount !== undefined && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="log-undo-btn"
                        onClick={() =>
                          proposeTransactionUndo(
                            entry.originalTime!,
                            entry.from!,
                            entry.to!,
                            entry.amount!
                          )
                        }
                      >
                        ↩ Undo
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>

      <SendMoneyModal
        show={sendModalPlayer !== null}
        sender={sendModalPlayer}
        players={players}
        onClose={() => setSendModalPlayer(null)}
        onSend={handleSendMoney}
      />
    </div>
  );
};

export default Bank;
