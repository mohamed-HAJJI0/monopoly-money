import { navigate, usePath, useRoutes } from "hookrouter";
import React, { useEffect } from "react";
import MetaTags from "./components/MetaTags";
import Navigation from "./components/Navigation";
import PageSizeWrapper from "./components/PageSizeWrapper";
import { routePaths } from "./constants";
import useGameHandler from "./hooks/useGameHandler";
import useStoredGames from "./hooks/useStoredGames";
import Bank from "./pages/Bank";
import Funds from "./pages/Funds";
import Help from "./pages/Help";
import History from "./pages/History";
import Home from "./pages/Home";
import Join from "./pages/Join";
import Settings from "./pages/Settings";
import { trackPageView } from "./utils";

const wrapRoute = (route: string, child: JSX.Element) => (
  <MetaTags route={route}>
    <PageSizeWrapper>{child}</PageSizeWrapper>
  </MetaTags>
);

/** Takes a route and returns all variants */
const getExtendedRoutes = (route: string) => {
  if (route.endsWith("/")) {
    return [route];
  }
  return [route, `${route}/`];
};

const App: React.FC = () => {
  const { storeGame } = useStoredGames(false);
  const { game, authInfo, initialize, clear } = useGameHandler();
  const path = usePath();

  useEffect(() => {
    trackPageView();
  }, [path]);

  // If the user has gone to a non-game route, clear the game state
  useEffect(() => {
    const nonGameRoutes = [
      ...getExtendedRoutes(routePaths.home),
      ...getExtendedRoutes(routePaths.join),
      ...getExtendedRoutes(routePaths.newGame)
    ];
    if (nonGameRoutes.includes(path)) {
      onGameDestroy();
    }
  }, [path]);

  // If the user has gone to a route that we don't manage, go home
  useEffect(() => {
    const allRoutes = Object.values(routePaths)
      .map((r) => getExtendedRoutes(r))
      .flat();
    if (!allRoutes.includes(path)) {
      console.log("exec1");
      navigate("/");
    }
  }, [path]);

  // Navigate home when a game is ended
  useEffect(() => {
    if (game === null && !getExtendedRoutes(routePaths.join).includes(path)) {
      navigate("/");
    }
  }, [game]);

  // Redirect banker-only hosts away from funds to bank
  useEffect(() => {
    if (game !== null && game.role === "banker" && path === routePaths.funds) {
      navigate(routePaths.bank);
    }
  }, [game, path]);

  const onGameSetup = (gameId: string, userToken: string, playerId: string, role: "player" | "banker" = "player") => {
    // Save current game for potential later use
    if (authInfo !== null) {
      storeGame(authInfo.gameId, authInfo.userToken, authInfo.playerId, authInfo.role);
    }

    // Setup a new game handler by setting up auth
    initialize({ gameId, userToken, playerId, role });

    // Store new game details
    storeGame(gameId, userToken, playerId, role);

    // Go into game
    if (role === "banker") {
      navigate("/bank");
    } else {
      navigate("/funds");
    }
  };

  const onGameDestroy = () => {
    if (authInfo !== null) {
      storeGame(authInfo.gameId, authInfo.userToken, authInfo.playerId, authInfo.role);
    }
    clear();
  };

  // Using Home as a "not found" component will put us back in the right place
  const NotFound = () => <Home onGameSetup={onGameSetup} />;

  const routes = {
    [routePaths.home]: () => wrapRoute(routePaths.home, <Home onGameSetup={onGameSetup} />),
    [routePaths.join]: () =>
      wrapRoute(routePaths.join, <Join newGame={false} onGameSetup={onGameSetup} />),
    [routePaths.newGame]: () =>
      wrapRoute(routePaths.newGame, <Join newGame={true} onGameSetup={onGameSetup} />),
    [routePaths.funds]:
      game !== null && game.role !== "banker"
        ? () =>
            wrapRoute(
              routePaths.funds,
              <Funds
                gameId={game.gameId}
                playerId={game.playerId}
                isGameOpen={game.open}
                players={game.players}
                useFreeParking={game.useFreeParking}
                freeParkingBalance={game.freeParkingBalance}
                showOppositionBalances={game.showOppositionBalances}
                proposeTransaction={game.actions.proposeTransaction}
                proposePlayerColorChange={game.actions.proposePlayerColorChange}
                events={game.events}
              />
            )
        : () => <NotFound />,
    [routePaths.bank]:
      game !== null && game.isBanker
        ? () =>
            wrapRoute(
              routePaths.bank,
              <Bank
                players={game.players}
                useFreeParking={game.useFreeParking}
                freeParkingBalance={game.freeParkingBalance}
                startingBalance={game.startingBalance}
                passGoAmount={game.passGoAmount}
                hasATransactionBeenMade={
                  game.events.filter((e) => e.type === "transaction").length > 0
                }
                events={game.events}
                undoneTransactions={game.undoneTransactions}
                proposeTransaction={game.actions.proposeTransaction}
                proposeTransactionUndo={game.actions.proposeTransactionUndo}
                proposePlayerColorChange={game.actions.proposePlayerColorChange}
              />
            )
        : () => <NotFound />,
    [routePaths.history]:
      game !== null
        ? () =>
            wrapRoute(
              routePaths.history,
              <History
                events={game.events}
                role={game.role}
                isBanker={game.isBanker}
                proposeTransactionUndo={game.actions.proposeTransactionUndo}
              />
            )
        : () => <NotFound />,
    [routePaths.settings]:
      game !== null && game.isBanker
        ? () =>
            wrapRoute(
              routePaths.settings,
              <Settings
                isGameOpen={game.open}
                useFreeParking={game.useFreeParking}
                showOppositionBalances={game.showOppositionBalances}
                players={game.players}
                gameId={game.gameId}
                startingBalance={game.startingBalance}
                passGoAmount={game.passGoAmount}
                hasATransactionBeenMade={
                  game.events.filter((e) => e.type === "transaction").length > 0
                }
                proposePlayerNameChange={game.actions.proposePlayerNameChange}
                proposePlayerColorChange={game.actions.proposePlayerColorChange}
                proposePlayerDelete={game.actions.proposePlayerDelete}
                proposeGameOpenStateChange={game.actions.proposeGameOpenStateChange}
                proposeUseFreeParkingChange={game.actions.proposeUseFreeParkingChange}
                proposeShowOppositionBalancesChange={
                  game.actions.proposeShowOppositionBalancesChange
                }
                proposeStartingBalanceChange={game.actions.proposeStartingBalanceChange}
                proposePassGoAmountChange={game.actions.proposePassGoAmountChange}
                proposeGameEnd={game.actions.proposeGameEnd}
              />
            )
        : () => <NotFound />,
    [routePaths.help]: () => wrapRoute(routePaths.help, <Help />)
  };

  const routesWithTrailingSlashes = Object.keys(routes).reduce(
    (acc, route) => {
      const extendedRoutes = getExtendedRoutes(route);
      return {
        ...acc,
        ...extendedRoutes.reduce(
          (acc1, extendedRoute) => ({ ...acc1, [extendedRoute]: routes[route] }),
          {}
        )
      };
    },
    {} as { [key: string]: () => JSX.Element }
  );

  const routeResult = useRoutes(routesWithTrailingSlashes);

  return (
    <>
      <Navigation inGame={game !== null} isBanker={game?.isBanker ?? false} role={game?.role ?? "player"} />
      <div className="my-3">{routeResult || <NotFound />}</div>
    </>
  );
};

export default App;
