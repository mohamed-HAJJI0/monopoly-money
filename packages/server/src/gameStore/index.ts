import Game from "./Game";
import { createUniqueGameId } from "./utils";

class GameStore {
  private games: Record<string, Game> = {};

  public createGame(initialBankersName: string, role: "player" | "banker" = "player", color?: string) {
    // Generate a game id
    const gameId = createUniqueGameId(Object.keys(this.games));

    // Create the game
    const deleteInstance = () => this.deleteGame(gameId);
    this.games[gameId] = new Game(deleteInstance);

    // Add the user that created this game and set them as a banker
    const game = this.games[gameId];

    if (role === "banker") {
      // Banker-only host: no player account, just an admin token
      const { userToken, playerId } = game.addBankerHost();
      return { gameId, userToken, playerId };
    }

    const { userToken, playerId } = game.addPlayer(initialBankersName, color);
    game.setPlayerBankerStatus(playerId, true, playerId);

    // Return the new game id and the users userToken
    return { gameId, userToken, playerId };
  }

  public doesGameExist(gameId: string) {
    return gameId in this.games;
  }

  public getGame(gameId: string) {
    return this.games[gameId];
  }

  public deleteGame(gameId: string) {
    delete this.games[gameId];
  }
}

export default new GameStore();
