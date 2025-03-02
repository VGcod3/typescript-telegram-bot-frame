import { Pokemon } from "../interfaces/pokemon";
import { prisma } from "./prisma.client";

export class PokemonDb {
  async createPokemon(data: Pokemon): Promise<Pokemon | null> {
    try {
      return await prisma.pokemon.create({
        data,
      });
    } catch (error) {
      console.log(error);
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
      console.log(error);
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
      console.log(error);
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
      console.log(error);
      return null;
    }
  }

  async getPokemonCount(): Promise<number> {
    try {
      return await prisma.pokemon.count();
    } catch (error) {
      console.log(error);
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
      console.log(error);
      return null;
    }
  }
}
