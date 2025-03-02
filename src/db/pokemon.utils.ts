import { Pokemon } from "../interfaces/pokemon";
import { prisma } from "./prisma.client";

export class PokemonDb {
  async createPokemon(data: Pokemon) {
    try {
      return await prisma.pokemon.create({
        data,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getPokemon(pokemonId: number) {
    try {
      return await prisma.pokemon.findUnique({
        where: {
          pokemonId,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async updatePokemon(pokemonId: number, data: Pokemon) {
    try {
      return await prisma.pokemon.update({
        where: {
          pokemonId,
        },
        data,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getAllPokemons({ skip, take }: { skip?: number; take?: number }) {
    try {
      return await prisma.pokemon.findMany({
        skip,
        take,
      });
    } catch (error) {
      console.log(error);
    }
  }
}
