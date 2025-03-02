import { SceneEnum } from "../enums/SceneEnum";
import { BaseScene } from "../scenes/base-scene/base.module";
import { HomeScene } from "../scenes/home-scene/home.module";
import { PokemonScene } from "../scenes/pokemon-scene/pokemon.module";
import { SettingScene } from "../scenes/setting-scene/setting.module";

type SceneConstructor = new () => BaseScene;

export class SceneFactory {
  private static sceneMap: Record<SceneEnum, SceneConstructor> = {
    [SceneEnum.Home]: HomeScene,
    [SceneEnum.Users]: HomeScene,

    [SceneEnum.Settings]: SettingScene,
    [SceneEnum.Notifications]: SettingScene,
    [SceneEnum.Language]: SettingScene,
    [SceneEnum.Theme]: SettingScene,

    [SceneEnum.Pokemon]: PokemonScene,
    [SceneEnum.GeneratePokemon]: PokemonScene,
    [SceneEnum.GetAllPokemons]: PokemonScene,
    // Add other scenes here
  };

  static buildScene(sceneName: SceneEnum): BaseScene {
    const SceneClass = this.sceneMap[sceneName];
    if (!SceneClass) {
      throw new Error("Unknown scene");
    }
    return new SceneClass();
  }
}
