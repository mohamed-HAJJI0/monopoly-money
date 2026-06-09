import { navigate, usePath } from "hookrouter";
import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { routePaths } from "../constants";
import BankIcon from "../img/bank.svg?react";

import FundsIcon from "../img/funds.svg?react";
import HelpIcon from "../img/help.svg?react";
import ListIcon from "../img/list.svg?react";
import SettingsIcon from "../img/settings.svg?react";
import ThemeToggle from "./ThemeToggle";
import "./Navigation.scss";

interface INavigationProps {
  inGame: boolean;
  isBanker: boolean;
  role: "player" | "banker";
}

interface INavbarLink {
  active: boolean;
  title: string;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  path: string;
}

const Navigation: React.FC<INavigationProps> = ({ inGame, isBanker, role }) => {
  const currentPath = usePath();

  const navbarLinks: INavbarLink[] = [
    {
      path: routePaths.funds,
      active: inGame && role === "player",
      title: "Funds",
      icon: FundsIcon
    },
    {
      path: routePaths.history,
      active: inGame,
      title: "History",
      icon: ListIcon
    },
    {
      path: routePaths.bank,
      active: inGame && isBanker,
      title: "Bank",
      icon: BankIcon
    },
    {
      path: routePaths.settings,
      active: inGame && isBanker,
      title: "Settings",
      icon: SettingsIcon
    },
    {
      path: routePaths.help,
      active: true,
      title: "Help",
      icon: HelpIcon
    }
  ];

  const goTo = (location: string) => () => navigate(location);

  return (
    <Navbar bg="light" variant="light" sticky="top" className="navigation">
      <Container>
        <Navbar.Brand onClick={goTo("/")} className="mr-1 nav-logo">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ cursor: "pointer" }}
          >
            <rect x="2" y="6" width="20" height="12" rx="2" fill="#22c55e" />
            <rect x="2" y="6" width="20" height="12" rx="2" stroke="#16a34a" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="3.5" fill="#16a34a" />
            <text
              x="12"
              y="13.5"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#ecfdf5"
              fontSize="5"
              fontWeight="700"
              fontFamily="system-ui, sans-serif"
            >
              $
            </text>
            <line x1="5" y1="9" x2="5" y2="9" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="19" y1="15" x2="19" y2="15" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </Navbar.Brand>
        <Nav className="mr-auto" style={{ overflowY: "auto" }}>
          {navbarLinks
            .filter((link) => link.active)
            .map((link) => {
              const Icon = link.icon;
              const isActive = currentPath === link.path;
              return (
                <Nav.Link
                  key={link.path}
                  href="#"
                  onClick={goTo(link.path)}
                  active={isActive}
                  className="p-0"
                >
                  <button
                    className={`nav-icon-button ${isActive ? "active" : ""}`}
                    title={link.title}
                  >
                    <Icon
                      style={{
                        height: 22,
                        width: 22,
                        fill: isActive ? "var(--primary)" : "var(--text-muted)"
                      }}
                    />
                    <span className="nav-label">{link.title}</span>
                  </button>
                </Nav.Link>
              );
            })}
        </Nav>
        <ThemeToggle />
      </Container>
    </Navbar>
  );
};

export default Navigation;
