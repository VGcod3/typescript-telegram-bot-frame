import { PokemonDb } from "../../db/pokemon.utils";
import { SceneEnum } from "../../enums/SceneEnum";
import { BaseScene } from "../base-scene/base.module";
import { PokemonController } from "./pokemon.controller";
import { PokemonService } from "./pokemon.service";

export class PokemonScene extends BaseScene {
  protected pokemonDb: PokemonDb;
  constructor() {
    super(SceneEnum.Pokemon);

    this.pokemonDb = new PokemonDb();
  }

  public enter() {
    new PokemonController(new PokemonService(this.pokemonDb));
  }
}
