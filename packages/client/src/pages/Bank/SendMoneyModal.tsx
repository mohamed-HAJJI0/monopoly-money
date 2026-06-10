import { IGameStatePlayer } from "@monopoly-money/game-state";
import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { formatCurrency } from "../../utils";

interface ISendMoneyModalProps {
  show: boolean;
  sender: IGameStatePlayer | null;
  players: IGameStatePlayer[];
  onClose: () => void;
  onSend: (recipientId: string, amount: number) => void;
}

const presetAmounts = [50, 100, 200, 500];

const SendMoneyModal: React.FC<ISendMoneyModalProps> = ({ show, sender, players, onClose, onSend }) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");

  const senderBalance = sender?.balance ?? 0;
  const numAmount = amount === "" ? 0 : parseInt(amount, 10);
  const isValidAmount = !isNaN(numAmount) && numAmount > 0 && numAmount <= senderBalance;

  const handleSend = () => {
    if (selectedPlayerId && isValidAmount) {
      onSend(selectedPlayerId, numAmount);
      setSelectedPlayerId(null);
      setAmount("");
      onClose();
    }
  };

  const selectAmount = (val: number) => {
    setAmount(val.toString());
  };

  const availablePlayers = sender ? players.filter((p) => p.playerId !== sender.playerId) : players;

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
        <Modal.Title>
          {sender ? `Send from ${sender.name}` : "Send Money"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {sender && (
          <div className="mb-3 text-center">
            <small className="text-muted">Available balance:</small>
            <div className="font-weight-bold">{formatCurrency(senderBalance)}</div>
          </div>
        )}

        <Form.Group>
          <Form.Label>Select Recipient</Form.Label>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {availablePlayers.map((player) => (
              <Button
                key={player.playerId}
                variant={selectedPlayerId === player.playerId ? "primary" : "outline-primary"}
                onClick={() => setSelectedPlayerId(player.playerId)}
                className="m-1"
              >
                {player.name}
                <br />
                <small>{formatCurrency(player.balance)}</small>
              </Button>
            ))}
          </div>
        </Form.Group>

        <Form.Group>
          <Form.Label>Amount</Form.Label>
          <div className="d-flex flex-wrap gap-2 mb-2">
            {presetAmounts.map((val) => {
              const affordable = senderBalance >= val;
              return (
                <Button
                  key={val}
                  variant={amount === val.toString() ? "success" : "outline-success"}
                  onClick={() => selectAmount(val)}
                  className="m-1"
                  disabled={!affordable}
                  title={!affordable ? "Insufficient balance" : undefined}
                >
                  {formatCurrency(val)}
                </Button>
              );
            })}
          </div>
          <Form.Control
            type="number"
            placeholder="Custom amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={1}
            max={senderBalance > 0 ? senderBalance : undefined}
            className="text-center"
            isInvalid={amount !== "" && (isNaN(numAmount) || numAmount <= 0 || numAmount > senderBalance)}
          />
          {amount !== "" && numAmount > senderBalance && (
            <Form.Control.Feedback type="invalid">
              Amount exceeds available balance of {formatCurrency(senderBalance)}.
            </Form.Control.Feedback>
          )}
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSend}
          disabled={!selectedPlayerId || !isValidAmount}
        >
          Send
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SendMoneyModal;
