import { GameEntity, IGameStatePlayer } from "@monopoly-money/game-state";
import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import MonopolyAmountInput from "../../components/MonopolyAmountInput";
import { bankName, freeParkingName } from "../../constants";
import { formatCurrency } from "../../utils";

interface ISendMoneyModalProps {
  balance: number;
  playerId: string;
  gameId: string;
  recipient: "freeParking" | "bank" | IGameStatePlayer;
  proposeTransaction: (from: GameEntity, to: GameEntity, amount: number) => void;
  onClose: () => void;
}

const STORAGE_KEY = "monopoly-money:recentAmounts";

const getRecipientKey = (recipient: "freeParking" | "bank" | IGameStatePlayer) => {
  if (recipient === "freeParking") return "freeParking";
  if (recipient === "bank") return "bank";
  return recipient.playerId;
};

const getRecentAmounts = (gameId: string, recipientKey: string): number[] => {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return data[`${gameId}:${recipientKey}`] || [];
  } catch {
    return [];
  }
};

const saveRecentAmount = (gameId: string, recipientKey: string, amount: number) => {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const key = `${gameId}:${recipientKey}`;
    const current = data[key] || [];
    // Remove if already exists, add to front, keep last 4 unique
    const updated = [amount, ...current.filter((a: number) => a !== amount)].slice(0, 4);
    data[key] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
};

const SendMoneyModal: React.FC<ISendMoneyModalProps> = ({
  balance,
  playerId,
  gameId,
  recipient,
  proposeTransaction,
  onClose
}) => {
  const [amount, setAmount] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const recipientKey = getRecipientKey(recipient);
  const recentAmounts = getRecentAmounts(gameId, recipientKey);

  const submit = () => {
    if (amount === null) {
      setSubmitError("Please provide an amount");
    } else if (amount <= 0) {
      setSubmitError("You must provide sum larger than $0");
    } else if (!Number.isInteger(amount)) {
      setSubmitError("The amount must be a whole number");
    } else if (amount > balance) {
      setSubmitError(`You do not have enough money (${formatCurrency(balance)})`);
    } else {
      proposeTransaction(
        playerId,
        recipient === "freeParking" || recipient === "bank" ? recipient : recipient.playerId,
        amount
      );
      saveRecentAmount(gameId, recipientKey, amount);
      close();
    }
  };

  const close = () => {
    setAmount(null);
    setSubmitError(null);
    onClose();
  };

  const getRecipientName = () => {
    if (recipient === "freeParking") {
      return freeParkingName;
    } else if (recipient === "bank") {
      return bankName;
    } else {
      return recipient.name;
    }
  };

  return (
    <Modal show={true} onHide={close} size="lg" centered className="send-money-modal">
      <Modal.Header
        closeButton
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        placeholder={undefined}
      >
        <Modal.Title>Transfer Funds</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-center">💵 → {getRecipientName()}</p>

        {/* Quick-send buttons from history */}
        {recentAmounts.length > 0 && (
          <div className="mb-3">
            <div className="small text-muted text-center mb-2">Recent amounts</div>
            <div className="d-flex justify-content-center flex-wrap gap-2">
              {recentAmounts.map((amt) => (
                <Button
                  key={amt}
                  variant={amount === amt ? "primary" : "outline-primary"}
                  size="sm"
                  onClick={() => setAmount(amt)}
                >
                  {formatCurrency(amt)}
                </Button>
              ))}
            </div>
          </div>
        )}

        <MonopolyAmountInput amount={amount} setAmount={setAmount} autoFocus={true} />

        <Button block variant="success" className="mt-2" onClick={submit}>
          Send
        </Button>

        <Form.Text style={{ color: "var(--danger)" }}>{submitError}</Form.Text>
      </Modal.Body>
    </Modal>
  );
};

export default SendMoneyModal;
