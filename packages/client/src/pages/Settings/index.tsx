import { IGameStatePlayer, PRESET_PLAYER_COLORS } from "@monopoly-money/game-state";
import React, { useState } from "react";
import { Button, Form, Table } from "react-bootstrap";
import { useModal } from "react-modal-hook";
import QRCode from "react-qr-code";
import ConnectedStateDot from "../../components/ConnectedStateDot";
import {
  formatCurrency,
  sortPlayersByName,
  trackFreeParkingDisabled,
  trackFreeParkingEnabled,
  trackNewPlayersAllowed,
  trackNewPlayersNotAllowed,
  trackShowOppositionBalancesDisabled,
  trackShowOppositionBalancesEnabled
} from "../../utils";
import DeletePlayerModal from "./DeletePlayerModal";
import EndGameConfirmDialog from "./EndGameConfirmDialog";
import RenamePlayerModal from "./RenamePlayerModal";
import "./Settings.scss";

interface ISettingsProps {
  isGameOpen: boolean;
  useFreeParking: boolean;
  showOppositionBalances: boolean;
  players: IGameStatePlayer[];
  gameId: string;
  startingBalance: number;
  passGoAmount: number;
  hasATransactionBeenMade: boolean;
  proposePlayerNameChange: (playerId: string, name: string) => void;
  proposePlayerColorChange: (playerId: string, color: string) => void;
  proposePlayerDelete: (playerId: string) => void;
  proposeGameOpenStateChange: (open: boolean) => void;
  proposeUseFreeParkingChange: (useFreeParking: boolean) => void;
  proposeShowOppositionBalancesChange: (showOppositionBalances: boolean) => void;
  proposeStartingBalanceChange: (startingBalance: number) => void;
  proposePassGoAmountChange: (passGoAmount: number) => void;
  proposeGameEnd: () => void;
}

const Settings: React.FC<ISettingsProps> = ({
  isGameOpen,
  useFreeParking,
  showOppositionBalances,
  players,
  gameId,
  startingBalance,
  passGoAmount,
  hasATransactionBeenMade,
  proposePlayerNameChange,
  proposePlayerColorChange,
  proposePlayerDelete,
  proposeGameOpenStateChange,
  proposeUseFreeParkingChange,
  proposeShowOppositionBalancesChange,
  proposeStartingBalanceChange,
  proposePassGoAmountChange,
  proposeGameEnd
}) => {
  const [actioningPlayer, setActioningPlayer] = useState<IGameStatePlayer | null>(null);
  const [showNameChangeModal, hideNameChangeModal] = useModal(
    () => (
      <>
        {actioningPlayer !== null && (
          <RenamePlayerModal
            player={actioningPlayer}
            proposePlayerNameChange={proposePlayerNameChange}
            onClose={hideNameChangeModal}
          />
        )}
      </>
    ),
    [actioningPlayer]
  );
  const [showDeletePlayerModal, hideDeletePlayerModal] = useModal(
    () => (
      <>
        {actioningPlayer !== null && (
          <DeletePlayerModal
            player={actioningPlayer}
            proposePlayerDelete={proposePlayerDelete}
            onClose={hideDeletePlayerModal}
          />
        )}
      </>
    ),
    [actioningPlayer]
  );
  const [showEndGameConfirmModal, hideEndGameConfirmModal] = useModal(
    () => (
      <>
        <EndGameConfirmDialog proposeGameEnd={proposeGameEnd} onClose={hideEndGameConfirmModal} />
      </>
    ),
    [actioningPlayer]
  );

  const toggleShowOppositionBalances = () => {
    if (showOppositionBalances) {
      trackShowOppositionBalancesDisabled();
    } else {
      trackShowOppositionBalancesEnabled();
    }
    proposeShowOppositionBalancesChange(!showOppositionBalances);
  };

  const toggleFreeParking = () => {
    if (useFreeParking) {
      trackFreeParkingDisabled();
    } else {
      trackFreeParkingEnabled();
    }
    proposeUseFreeParkingChange(!useFreeParking);
  };

  const toggleNewPlayersAllowed = () => {
    if (isGameOpen) {
      trackNewPlayersNotAllowed();
    } else {
      trackNewPlayersAllowed();
    }
    proposeGameOpenStateChange(!isGameOpen);
  };

  const shareLink = `${window.location.origin}/join?gameId=${gameId}`;

  return (
    <div className="settings">
      {isGameOpen && (
        <div className="qr-section text-center mb-4 p-4">
          <h5>Invite Players</h5>
          <p className="mb-3" style={{ color: "var(--text-muted)" }}>
            Scan the QR code to join
          </p>
          <div className="d-flex justify-content-center">
            <div
              style={{
                display: "inline-block",
                padding: 16,
                background: "#fff",
                borderRadius: "var(--radius)"
              }}
            >
              <QRCode value={shareLink} size={160} />
            </div>
          </div>
          <div className="mt-3">
            <small style={{ color: "var(--text-muted)" }}>
              Game ID: <strong>{gameId}</strong>
            </small>
          </div>
        </div>
      )}

      <h5 className="mb-3">Game Rules</h5>
      <div className="settings-card">
        <Form.Group>
          <Form.Label>Starting Balance for New Players</Form.Label>
          <div className="d-flex align-items-center gap-3">
            <Form.Control
              type="number"
              value={startingBalance}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 0) {
                  proposeStartingBalanceChange(val);
                }
              }}
              className="text-center"
              style={{ maxWidth: 150 }}
            />
            <small style={{ color: "var(--text-muted)" }}>
              {hasATransactionBeenMade
                ? "Existing players keep their current balance."
                : "All current players will be auto-initialized to this amount."}
            </small>
          </div>
        </Form.Group>

        <Form.Group className="mt-4">
          <Form.Label>Pass GO Amount</Form.Label>
          <div className="d-flex align-items-center gap-3">
            <Form.Control
              type="number"
              value={passGoAmount}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 0) {
                  proposePassGoAmountChange(val);
                }
              }}
              className="text-center"
              style={{ maxWidth: 150 }}
            />
            <small style={{ color: "var(--text-muted)" }}>Amount given when a player passes GO.</small>
          </div>
        </Form.Group>
      </div>

      <h5 className="mb-3">Players</h5>
      <div className="settings-card" style={{ overflowX: "auto" }}>
        <Table striped bordered hover size="sm" style={{ minWidth: 500 }}>
          <thead>
            <tr>
              <th></th>
              <th>Color</th>
              <th>Name</th>
              <th>Balance</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sortPlayersByName(players).map((player) => (
              <tr key={player.playerId} className="player-row">
                <td>
                  <ConnectedStateDot connected={player.connected} />
                </td>
                <td>
                  <div className="d-flex flex-wrap" style={{ maxWidth: 120 }}>
                    {PRESET_PLAYER_COLORS.map((c) => {
                      const isTaken = players.some((p) => p.playerId !== player.playerId && p.color === c);
                      const isCurrent = player.color === c;
                      return (
                        <button
                          key={c}
                          onClick={() => !isTaken && proposePlayerColorChange(player.playerId, c)}
                          disabled={isTaken}
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            backgroundColor: c,
                            border: isCurrent ? "2px solid var(--body-color)" : "1px solid transparent",
                            cursor: isTaken ? "not-allowed" : "pointer",
                            opacity: isTaken ? 0.3 : 1,
                            margin: 1
                          }}
                          aria-label={isTaken ? `Color ${c} taken` : `Change color to ${c}`}
                        />
                      );
                    })}
                  </div>
                </td>
                <td>{player.name}</td>
                <td>{formatCurrency(player.balance)}</td>
                <td>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    title="Rename"
                    onClick={() => {
                      setActioningPlayer(player);
                      showNameChangeModal();
                    }}
                  >
                    <span role="img" aria-label="Rename">
                      ✏️
                    </span>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    title="Remove"
                    className="ml-1"
                    onClick={() => {
                      setActioningPlayer(player);
                      showDeletePlayerModal();
                    }}
                  >
                    <span role="img" aria-label="Remove">
                      🗑️
                    </span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Button block variant="info" className="settings-btn" onClick={toggleShowOppositionBalances}>
        {showOppositionBalances ? "Hide" : "Show"} Opposition Balances
      </Button>

      <Button block variant="info" className="settings-btn" onClick={toggleFreeParking}>
        {useFreeParking ? "Disable" : "Enable"} the Free Parking House Rule
      </Button>

      <Button block variant="primary" className="settings-btn" onClick={toggleNewPlayersAllowed}>
        {isGameOpen ? "Close" : "Open"} Game To New Players
      </Button>

      <Button block variant="danger" className="settings-btn" onClick={() => showEndGameConfirmModal()}>
        End Game
      </Button>

      <div className="mt-5 text-center">
        <div>
          <small style={{ color: "var(--text-muted)" }}>Find this app helpful?</small>
        </div>
        <a href="https://www.buymeacoffee.com/brentvollebregt" target="_blank">
          <Button block variant="warning" className="mt-2">
            🍺 Buy a beer to say thanks 🍺
          </Button>
        </a>
      </div>
    </div>
  );
};

export default Settings;
