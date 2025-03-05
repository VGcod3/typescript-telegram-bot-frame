import { FavoritesDb } from "../favorites.db";
import { prisma } from "../prisma.client";
import { Favorite } from "../../interfaces/favorite";

jest.mock("../prisma.client", () => ({
  prisma: {
    favorite: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

describe("FavoritesDb", () => {
  let favoritesDb: FavoritesDb;
  const mockFavorite: Favorite = {
    userId: 123,
    pokemonId: 1,
  };

  beforeEach(() => {
    favoritesDb = new FavoritesDb();
    jest.clearAllMocks();
  });

  describe("createFavorite", () => {
    it("should create a favorite when it does not exist", async () => {
      (prisma.favorite.findMany as jest.Mock).mockResolvedValueOnce([]);
      (prisma.favorite.create as jest.Mock).mockResolvedValueOnce(mockFavorite);

      const result = await favoritesDb.createFavorite(mockFavorite);
      expect(result).toEqual(mockFavorite);
      expect(prisma.favorite.create).toHaveBeenCalledWith({
        data: mockFavorite,
      });
    });

    it("should return null when favorite already exists", async () => {
      (prisma.favorite.findMany as jest.Mock).mockResolvedValueOnce([
        mockFavorite,
      ]);

      const result = await favoritesDb.createFavorite(mockFavorite);
      expect(result).toBeNull();
    });

    it("should handle database errors", async () => {
      (prisma.favorite.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB Error"),
      );

      const result = await favoritesDb.createFavorite(mockFavorite);
      expect(result).toBeNull();

      expect(prisma.favorite.create).not.toHaveBeenCalled();
    });
  });

  describe("getFavoriteById", () => {
    it("should return favorite when found", async () => {
      (prisma.favorite.findUnique as jest.Mock).mockResolvedValueOnce(
        mockFavorite,
      );

      const result = await favoritesDb.getFavoriteById("1", 123);
      expect(result).toEqual(mockFavorite);
    });

    it("should handle not found case", async () => {
      (prisma.favorite.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const result = await favoritesDb.getFavoriteById("999", 123);
      expect(result).toBeNull();
    });

    it("should handle database errors", async () => {
      (prisma.favorite.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error("DB Error"),
      );

      const result = await favoritesDb.getFavoriteById("1", 123);
      expect(result).toBeNull();
    });
  });

  describe("getFavoriteForUserByPokemonId", () => {
    it("should return favorites when found", async () => {
      (prisma.favorite.findMany as jest.Mock).mockResolvedValueOnce([
        mockFavorite,
      ]);

      const result = await favoritesDb.getFavoriteForUserByPokemonId(123, 1);
      expect(result).toEqual([mockFavorite]);
    });

    it("should return empty array when no favorites found", async () => {
      (prisma.favorite.findMany as jest.Mock).mockResolvedValueOnce([]);

      const result = await favoritesDb.getFavoriteForUserByPokemonId(123, 999);
      expect(result).toEqual([]);
    });

    it("should handle database errors", async () => {
      (prisma.favorite.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB Error"),
      );

      const result = await favoritesDb.getFavoriteForUserByPokemonId(123, 1);
      expect(result).toBeNull();
    });
  });

  describe("getAllFavoritesByUserId", () => {
    it("should return favorites when found", async () => {
      (prisma.favorite.findMany as jest.Mock).mockResolvedValueOnce([
        mockFavorite,
      ]);

      const result = await favoritesDb.getAllFavoritesByUserId(123);
      expect(result).toEqual([mockFavorite]);
    });

    it("should return empty array when no favorites found", async () => {
      (prisma.favorite.findMany as jest.Mock).mockResolvedValueOnce([]);

      const result = await favoritesDb.getAllFavoritesByUserId(123);
      expect(result).toEqual([]);
    });

    it("should handle database errors", async () => {
      (prisma.favorite.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB Error"),
      );

      const result = await favoritesDb.getAllFavoritesByUserId(123);
      expect(result).toBeNull();
    });
  });

  describe("deleteFavoriteByPokemonId", () => {
    it("should delete favorites when found", async () => {
      (prisma.favorite.deleteMany as jest.Mock).mockResolvedValueOnce({
        count: 1,
      });

      const result = await favoritesDb.deleteFavoriteByPokemonId(1, 123);
      expect(result).toBe(true);
    });

    it("should return false when no favorites found", async () => {
      (prisma.favorite.deleteMany as jest.Mock).mockResolvedValueOnce({
        count: 0,
      });

      const result = await favoritesDb.deleteFavoriteByPokemonId(1, 123);
      expect(result).toBe(false);
    });

    it("should handle database errors", async () => {
      (prisma.favorite.deleteMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB Error"),
      );

      const result = await favoritesDb.deleteFavoriteByPokemonId(1, 123);
      expect(result).toBe(false);
    });
  });
});
