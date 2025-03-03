import { Logger } from "../modules/Logger";
import { Favorite } from "../interfaces/favorite";
import { prisma } from "./prisma.client";

export class FavoritesDb {
  async createFavorite(favorite: Favorite): Promise<Favorite | null> {
    const favoriteExists = await this.getFavoriteForUserByPokemonId(
      favorite.userId,
      favorite.pokemonId,
    );

    if (favoriteExists && favoriteExists.length > 0) {
      return null;
    }

    try {
      return await prisma.favorite.create({
        data: favorite,
      });
    } catch (error) {
      Logger.error(`Error creating favorite: ${error}`, "FavoritesDb");
      return null;
    }
  }

  async getFavoriteById(favoriteId: string, userId: number) {
    try {
      return await prisma.favorite.findUnique({
        where: {
          id: favoriteId,
          userId,
        },
      });
    } catch (error) {
      Logger.error(`Error getting favorite by id: ${error}`, "FavoritesDb");
    }
  }

  async getFavoriteForUserByPokemonId(
    userId: number,
    pokemonId: number,
  ): Promise<Favorite[] | null> {
    try {
      return await prisma.favorite.findMany({
        where: {
          userId,
          pokemonId,
        },
      });
    } catch (error) {
      Logger.error(
        `Error getting favorite by user and pokemon id: ${error}`,
        "FavoritesDb",
      );
      return null;
    }
  }

  async getAllFavoritesByUserId(userId: number): Promise<Favorite[] | null> {
    try {
      return await prisma.favorite.findMany({
        where: {
          userId,
        },
      });
    } catch (error) {
      Logger.error(
        `Error getting all favorites by user id: ${error}`,
        "FavoritesDb",
      );
      return null;
    }
  }

  async deleteFavoriteByPokemonId(pokemonId: number, userId: number) {
    try {
      await prisma.favorite.deleteMany({
        where: {
          userId,
          pokemonId,
        },
      });
    } catch (error) {
      Logger.error(
        `Error deleting favorite by pokemon id: ${error}`,
        "FavoritesDb",
      );
      return null;
    }
  }
}
