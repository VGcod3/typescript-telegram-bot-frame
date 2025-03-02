import { FavoritesDb } from "../../db/favorites.db";
import { PokemonDb } from "../../db/pokemon.db";
import { SceneEnum } from "../../enums/SceneEnum";
import { BaseScene } from "../base-scene/base.module";
import { PokemonController } from "./pokemon.controller";
import { PokemonService } from "./pokemon.service";

export class PokemonScene extends BaseScene {
  protected pokemonDb: PokemonDb;
  protected favoritesDb: FavoritesDb;
  constructor() {
    super(SceneEnum.Pokemon);

    this.pokemonDb = new PokemonDb();
    this.favoritesDb = new FavoritesDb();
  }

  public enter() {
    new PokemonController(new PokemonService(this.pokemonDb, this.favoritesDb));
  }
}
