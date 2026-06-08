import { IGameStatePlayer } from "@monopoly-money/game-state";
import React, { useState } from "react";
import { Button, Form, Table } from "react-bootstrap";
import { useModal } from "react-modal-hook";
import QRCode from "react-qr-code";
import ConnectedStateDot from "../../components/ConnectedStateDot";
import ThemeToggle from "../../components/ThemeToggle";
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
        <div className="qr-section text-center mb-4 p-3 rounded border">
          <h5>Invite Players</h5>
          <p className="text-muted mb-2">Scan the QR code to join</p>
          <div className="d-flex justify-content-center">
            <QRCode value={shareLink} size={160} />
          </div>
          <div className="mt-2">
            <small className="text-muted">Game ID: <strong>{gameId}</strong></small>
          </div>
        </div>
      )}

      <h5 className="mb-3">Game Rules</h5>
      <div className="mb-3 p-3 rounded border">
        <Form.Group>
          <Form.Label>Starting Balance for New Players</Form.Label>
          <div className="d-flex align-items-center gap-2">
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
            <small className="text-muted">
              {hasATransactionBeenMade
                ? "Existing players keep their current balance."
                : "All current players will be auto-initialized to this amount."}
            </small>
          </div>
        </Form.Group>

        <Form.Group className="mt-3">
          <Form.Label>Pass GO Amount</Form.Label>
          <div className="d-flex align-items-center gap-2">
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
            <small className="text-muted">Amount given when a player passes GO.</small>
          </div>
        </Form.Group>
      </div>

      <h5 className="mb-3">Players</h5>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th></th>
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

      <Button block variant="info" onClick={toggleShowOppositionBalances}>
        {showOppositionBalances ? "Hide" : "Show"} opposition balances
      </Button>

      <Button block variant="info" onClick={toggleFreeParking}>
        {useFreeParking ? "Disable" : "Enable"} the Free Parking House Rule
      </Button>

      <Button block variant="primary" onClick={toggleNewPlayersAllowed}>
        {isGameOpen ? "Close" : "Open"} Game To New Players
      </Button>

      <Button block variant="danger" onClick={() => showEndGameConfirmModal()}>
        End Game
      </Button>

      <div className="mt-4">
        <ThemeToggle block />
      </div>

      <div className="mt-5 text-center">
        <div>
          <small>Find this app helpful?</small>
        </div>
        <a href="https://www.buymeacoffee.com/brentvollebregt" target="_blank">
          <Button block variant="warning">
            🍺 Buy a beer to say thanks 🍺
          </Button>
        </a>
      </div>
    </div>
  );
};

export default Settings;
