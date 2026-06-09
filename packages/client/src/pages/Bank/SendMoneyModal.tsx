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

  const handleSend = () => {
    const numAmount = parseInt(amount, 10);
    if (selectedPlayerId && numAmount > 0) {
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
            {presetAmounts.map((val) => (
              <Button
                key={val}
                variant={amount === val.toString() ? "success" : "outline-success"}
                onClick={() => selectAmount(val)}
                className="m-1"
              >
                {formatCurrency(val)}
              </Button>
            ))}
          </div>
          <Form.Control
            type="number"
            placeholder="Custom amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={1}
            className="text-center"
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSend}
          disabled={!selectedPlayerId || !amount || parseInt(amount, 10) <= 0}
        >
          Send
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SendMoneyModal;
