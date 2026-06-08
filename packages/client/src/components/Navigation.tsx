import { navigate, usePath } from "hookrouter";
import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { routePaths } from "../constants";
import BankIcon from "../img/bank.svg?react";
import BannerImage from "../img/banner.png";
import FundsIcon from "../img/funds.svg?react";
import HelpIcon from "../img/help.svg?react";
import ListIcon from "../img/list.svg?react";
import SettingsIcon from "../img/settings.svg?react";
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
        <Navbar.Brand onClick={goTo("/")} className="mr-1">
          <img
            src={BannerImage}
            height="30"
            className="d-inline-block align-top"
            alt="Monopoly Money Banner Logo"
            style={{ cursor: "pointer" }}
          />
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
      </Container>
    </Navbar>
  );
};

export default Navigation;
