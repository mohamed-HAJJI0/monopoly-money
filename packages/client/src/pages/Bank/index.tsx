import { GameEntity, GameEvent, IGameStatePlayer } from "@monopoly-money/game-state";
import React, { useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { DateTime } from "luxon";
import { formatCurrency, sortPlayersByName } from "../../utils";
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
  proposeTransaction: (from: GameEntity, to: GameEntity, amount: number) => void;
}

const Bank: React.FC<IBankProps> = ({
  players,
  useFreeParking,
  freeParkingBalance,
  startingBalance,
  passGoAmount,
  hasATransactionBeenMade,
  events,
  proposeTransaction
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [showSendModal, setShowSendModal] = useState(false);

  const selectedPlayer = players.find((p) => p.playerId === selectedPlayerId);

  const handlePassGo = () => {
    if (selectedPlayerId) {
      proposeTransaction("bank", selectedPlayerId, passGoAmount);
    }
  };

  const handlePresetDeduction = (amount: number) => {
    if (selectedPlayerId) {
      proposeTransaction(selectedPlayerId, "bank", amount);
    }
  };

  const handleCustomGive = () => {
    const amt = parseInt(customAmount, 10);
    if (selectedPlayerId && amt > 0) {
      proposeTransaction("bank", selectedPlayerId, amt);
      setCustomAmount("");
    }
  };

  const handleCustomTake = () => {
    const amt = parseInt(customAmount, 10);
    if (selectedPlayerId && amt > 0) {
      proposeTransaction(selectedPlayerId, "bank", amt);
      setCustomAmount("");
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

  const handleSendMoney = (playerId: string, amount: number) => {
    if (selectedPlayerId) {
      proposeTransaction(selectedPlayerId, playerId, amount);
    }
  };

  const getLogEntry = (event: GameEvent): string | null => {
    const time = DateTime.fromISO(event.time).toFormat("h:mm a");
    switch (event.type) {
      case "transaction": {
        const fromName =
          event.from === "bank" ? "Bank" : event.from === "freeParking" ? "Free Parking" : players.find((p) => p.playerId === event.from)?.name ?? "?";
        const toName =
          event.to === "bank" ? "Bank" : event.to === "freeParking" ? "Free Parking" : players.find((p) => p.playerId === event.to)?.name ?? "?";
        return `[${time}] ${fromName} → ${toName}: ${formatCurrency(event.amount)}`;
      }
      case "playerJoin":
        return `[${time}] ${event.name} joined`;
      case "playerDelete": {
        const name = players.find((p) => p.playerId === event.playerId)?.name ?? "?";
        return `[${time}] ${name} removed`;
      }
      case "playerNameChange": {
        const name = players.find((p) => p.playerId === event.playerId)?.name ?? "?";
        return `[${time}] ${name} renamed`;
      }
      case "startingBalanceChange":
        return `[${time}] Starting balance set to ${formatCurrency(event.startingBalance)}`;
      case "passGoAmountChange":
        return `[${time}] Pass GO set to ${formatCurrency(event.passGoAmount)}`;
      default:
        return null;
    }
  };

  const logEntries = events
    .map((e) => getLogEntry(e))
    .filter((e): e is string => e !== null)
    .reverse();

  return (
    <div className="bank">
      <Row>
        <Col md={8}>
          <h5 className="mb-3">Players</h5>

          {!hasATransactionBeenMade && (
            <Button
              variant="outline-primary"
              block
              className="mb-3"
              onClick={handleInitialize}
            >
              Initialise All Players to {formatCurrency(startingBalance)}
            </Button>
          )}

          <div className="player-grid mb-3">
            {sortPlayersByName(players).map((player) => (
              <Card
                key={player.playerId}
                className={`player-card mb-2 ${selectedPlayerId === player.playerId ? "selected" : ""}`}
                onClick={() => setSelectedPlayerId(player.playerId)}
              >
                <Card.Body className="p-2 d-flex align-items-center justify-content-between">
                  <div>
                    <Form.Check
                      type="radio"
                      name="playerSelector"
                      id={`player-${player.playerId}`}
                      label={player.name}
                      checked={selectedPlayerId === player.playerId}
                      onChange={() => setSelectedPlayerId(player.playerId)}
                    />
                  </div>
                  <div className="font-weight-bold">{formatCurrency(player.balance)}</div>
                </Card.Body>
              </Card>
            ))}
          </div>

          {selectedPlayer && (
            <div className="actions-panel">
              <h6>Actions for {selectedPlayer.name}</h6>

              <div className="fast-actions d-flex flex-wrap gap-2 mb-2">
                <Button variant="success" onClick={handlePassGo} className="m-1">
                  Pass GO (+{formatCurrency(passGoAmount)})
                </Button>
                <Button variant="warning" onClick={() => handlePresetDeduction(100)} className="m-1">
                  -{formatCurrency(100)}
                </Button>
                <Button variant="warning" onClick={() => handlePresetDeduction(50)} className="m-1">
                  -{formatCurrency(50)}
                </Button>
                <Button variant="warning" onClick={() => handlePresetDeduction(25)} className="m-1">
                  -{formatCurrency(25)}
                </Button>
                <Button variant="info" onClick={() => setShowSendModal(true)} className="m-1">
                  Send Money
                </Button>
              </div>

              <div className="custom-action d-flex align-items-center gap-2 mb-3">
                <Form.Control
                  type="number"
                  placeholder="Amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="text-center"
                  style={{ maxWidth: 120 }}
                />
                <Button variant="primary" onClick={handleCustomGive} disabled={!customAmount || parseInt(customAmount, 10) <= 0}>
                  Give
                </Button>
                <Button variant="danger" onClick={handleCustomTake} disabled={!customAmount || parseInt(customAmount, 10) <= 0}>
                  Take
                </Button>
              </div>
            </div>
          )}

          {useFreeParking && freeParkingBalance > 0 && (
            <Card className="mb-3">
              <Card.Body className="p-2 text-center">
                <strong>Free Parking:</strong> {formatCurrency(freeParkingBalance)}
                {selectedPlayerId && (
                  <Button
                    variant="warning"
                    size="sm"
                    className="ml-2"
                    onClick={() =>
                      selectedPlayerId && proposeTransaction("freeParking", selectedPlayerId, freeParkingBalance)
                    }
                  >
                    Give to {selectedPlayer?.name}
                  </Button>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col md={4}>
          <div className="log-panel">
            <h5 className="mb-2">Transaction Log</h5>
            <div className="log-entries">
              {logEntries.length === 0 ? (
                <div className="text-muted text-center">No transactions yet</div>
              ) : (
                logEntries.map((entry, idx) => (
                  <div key={idx} className="log-entry mb-1 p-1 rounded">
                    <small>{entry}</small>
                  </div>
                ))
              )}
            </div>
          </div>
        </Col>
      </Row>

      <SendMoneyModal
        show={showSendModal}
        players={players.filter((p) => p.playerId !== selectedPlayerId)}
        onClose={() => setShowSendModal(false)}
        onSend={handleSendMoney}
      />
    </div>
  );
};

export default Bank;
