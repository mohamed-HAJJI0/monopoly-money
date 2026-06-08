import React from "react";
import { Card } from "react-bootstrap";
import ConnectedStateDot from "../../components/ConnectedStateDot";
import { formatCurrency } from "../../utils";

interface IPlayerCardProps {
  name: string;
  color: string | null | undefined;
  connected: boolean | null;
  balance: number | null;
  onClick: () => void;
}

const PlayerCard: React.FC<IPlayerCardProps> = ({ name, color, connected, balance, onClick }) => {
  return (
    <Card className="player-card text-center" style={color ? { borderLeft: `4px solid ${color}` } : undefined}>
      {connected !== null && <ConnectedStateDot connected={connected} className="m-2" />}
      <Card.Body className="p-3" onClick={onClick}>
        <div className="d-flex align-items-center justify-content-center gap-2">
          {color && (
            <span
              className="color-dot"
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: color,
                display: "inline-block",
                border: "1px solid rgba(0,0,0,0.2)"
              }}
            />
          )}
          <span>{name}</span>
        </div>
        {balance !== null && <div>{Number.isFinite(balance) ? formatCurrency(balance) : "∞"}</div>}
      </Card.Body>
    </Card>
  );
};

export default PlayerCard;
