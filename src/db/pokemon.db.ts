import { Pokemon } from "../interfaces/pokemon";
import { Logger } from "../modules/Logger";
import { prisma } from "./prisma.client";

export class PokemonDb {
  async createPokemon(data: Pokemon): Promise<Pokemon | null> {
    try {
      return await prisma.pokemon.create({
        data,
      });
    } catch (error) {
      Logger.error(`Error creating pokemon: ${error}`);
      return null;
    }
  }

  async getPokemon(pokemonId: string): Promise<Pokemon | null> {
    try {
      return await prisma.pokemon.findUnique({
        where: {
          id: pokemonId,
        },
      });
    } catch (error) {
      Logger.error(`Error getting pokemon: ${error}`, "PokemonDb");
      return null;
    }
  }

  async updatePokemon(
    pokemonId: string,
    data: Pokemon,
  ): Promise<Pokemon | null> {
    try {
      return await prisma.pokemon.update({
        where: {
          id: pokemonId,
        },
        data,
      });
    } catch (error) {
      Logger.error(`Error updating pokemon: ${error}`, "PokemonDb");
      return null;
    }
  }

  async getPaginatedPokemon({
    userId,
    skip,
    take,
  }: {
    userId: number;
    skip?: number;
    take?: number;
  }): Promise<
    | (Pokemon & {
        isFavorited: boolean;
      })
    | null
  > {
    try {
      const pokemons = await prisma.pokemon.findMany({
        skip,
        take,
        include: {
          favoritedBy: {
            where: { userId },
            select: { id: true }, // Only checking existence
          },
        },
      });

      return pokemons.map((pokemon) => ({
        ...pokemon,
        isFavorited: !!pokemon.favoritedBy.length,
      }))[0];
    } catch (error) {
      Logger.error(`Error getting paginated pokemon: ${error}`, "PokemonDb");
      return null;
    }
  }

  async getPokemonCount(): Promise<number> {
    try {
      return await prisma.pokemon.count();
    } catch (error) {
      Logger.error(`Error getting pokemon count: ${error}`, "PokemonDb");
      return 0;
    }
  }

  async getPokemonById(pokemonId: string): Promise<Pokemon | null> {
    try {
      return await prisma.pokemon.findUnique({
        where: {
          id: pokemonId,
        },
      });
    } catch (error) {
      Logger.error(`Error getting pokemon by id: ${error}`, "PokemonDb");
      return null;
    }
  }
}
