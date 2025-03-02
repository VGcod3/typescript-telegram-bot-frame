export type Pokemon = {
  pokemonId: number;
  name: string;

  image: string;
  type: string;

  level?: number;
  hp?: number;
  attack?: number;
  defense?: number;
  speed?: number;
};
