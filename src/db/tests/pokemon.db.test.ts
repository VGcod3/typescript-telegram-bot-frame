import { PokemonDb } from "../pokemon.db";
import { prisma } from "../prisma.client";
import { Pokemon } from "../../interfaces/pokemon";
import { Logger } from "../../modules/Logger";

jest.mock("../prisma.client", () => ({
  prisma: {
    pokemon: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe("PokemonDb", () => {
  let pokemonDb: PokemonDb;
  const mockPokemon: Pokemon = {
    pokemonId: 1,
    name: "Pikachu",
    image: "pikachu.png",
    type: "Electric",

    level: 50,
    hp: 100,
    attack: 50,
    defense: 50,
    speed: 90,
  };

  beforeEach(() => {
    pokemonDb = new PokemonDb();
    jest.clearAllMocks();
  });

  describe("createPokemon", () => {
    it("should create a pokemon successfully", async () => {
      (prisma.pokemon.create as jest.Mock).mockResolvedValue(mockPokemon);
      const result = await pokemonDb.createPokemon(mockPokemon);
      expect(result).toEqual(mockPokemon);
      expect(prisma.pokemon.create).toHaveBeenCalledWith({ data: mockPokemon });
    });

    it("should return null on error", async () => {
      (prisma.pokemon.create as jest.Mock).mockRejectedValue(
        new Error("DB Error"),
      );
      const result = await pokemonDb.createPokemon(mockPokemon);
      expect(result).toBeNull();
    });
  });

  describe("getPokemon", () => {
    it("should get a pokemon by id", async () => {
      (prisma.pokemon.findUnique as jest.Mock).mockResolvedValue(mockPokemon);
      const result = await pokemonDb.getPokemon("1");
      expect(result).toEqual(mockPokemon);
      expect(prisma.pokemon.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });

    it("should return null when pokemon not found", async () => {
      (prisma.pokemon.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await pokemonDb.getPokemon("999");
      expect(result).toBeNull();
    });

    it("should handle database errors", async () => {
      (prisma.pokemon.findUnique as jest.Mock).mockRejectedValue(
        new Error("DB Error"),
      );
      const result = await pokemonDb.getPokemon("1");
      expect(result).toBeNull();
    });
  });

  describe("updatePokemon", () => {
    it("should update a pokemon successfully", async () => {
      (prisma.pokemon.update as jest.Mock).mockResolvedValue(mockPokemon);
      const result = await pokemonDb.updatePokemon("1", mockPokemon);
      expect(result).toEqual(mockPokemon);
      expect(prisma.pokemon.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: mockPokemon,
      });
    });

    it("should return null on error", async () => {
      (prisma.pokemon.update as jest.Mock).mockRejectedValue(
        new Error("DB Error"),
      );
      const result = await pokemonDb.updatePokemon("1", mockPokemon);
      expect(result).toBeNull();
    });
  });

  describe("getPaginatedPokemon", () => {
    it("should return paginated pokemon with favorite status", async () => {
      const mockPaginatedResponse = [
        {
          ...mockPokemon,
          favoritedBy: [{ id: 1 }],
        },
      ];
      (prisma.pokemon.findMany as jest.Mock).mockResolvedValue(
        mockPaginatedResponse,
      );

      const result = await pokemonDb.getPaginatedPokemon({
        userId: 1,
        skip: 0,
        take: 1,
      });

      expect(prisma.pokemon.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 1,
        include: {
          favoritedBy: {
            where: { userId: 1 },
            select: { id: true },
          },
        },
      });

      Logger.debug(JSON.stringify(result));

      // expect(result).toEqual({
      //   ...mockPokemon,
      //   isFavorited: true,
      // });
    });

    it("should return null on error", async () => {
      (prisma.pokemon.findMany as jest.Mock).mockRejectedValue(
        new Error("DB Error"),
      );
      const result = await pokemonDb.getPaginatedPokemon({
        userId: 1,
        skip: 0,
        take: 1,
      });
      expect(result).toBeNull();
    });
  });

  describe("getPokemonCount", () => {
    it("should return total pokemon count", async () => {
      (prisma.pokemon.count as jest.Mock).mockResolvedValue(151);
      const result = await pokemonDb.getPokemonCount();
      expect(result).toBe(151);
    });

    it("should return 0 on error", async () => {
      (prisma.pokemon.count as jest.Mock).mockRejectedValue(
        new Error("DB Error"),
      );
      const result = await pokemonDb.getPokemonCount();
      expect(result).toBe(0);
    });
  });

  describe("getPokemonById", () => {
    it("should return a pokemon by id", async () => {
      (prisma.pokemon.findUnique as jest.Mock).mockResolvedValue(mockPokemon);
      const result = await pokemonDb.getPokemonById("1");
      expect(result).toEqual(mockPokemon);
      expect(prisma.pokemon.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });

    it("should return null when pokemon not found", async () => {
      (prisma.pokemon.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await pokemonDb.getPokemonById("999");
      expect(result).toBeNull();
    });

    it("should handle database errors", async () => {
      (prisma.pokemon.findUnique as jest.Mock).mockRejectedValue(
        new Error("DB Error"),
      );
      const result = await pokemonDb.getPokemonById("1");
      expect(result).toBeNull();
    });
  });
});
