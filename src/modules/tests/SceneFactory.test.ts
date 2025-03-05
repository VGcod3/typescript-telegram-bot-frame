import { SceneEnum } from "../../enums/SceneEnum";
import { SceneFactory } from "../SceneFactory";
import { HomeScene } from "../../scenes/home-scene/home.module";
import { SettingScene } from "../../scenes/setting-scene/setting.module";
import { PokemonScene } from "../../scenes/pokemon-scene/pokemon.module";

describe("SceneFactory", () => {
  describe("buildScene", () => {
    it("should create HomeScene instance for Home scene", () => {
      const scene = SceneFactory.buildScene(SceneEnum.Home);
      expect(scene).toBeInstanceOf(HomeScene);
    });

    it("should create HomeScene instance for Users scene", () => {
      const scene = SceneFactory.buildScene(SceneEnum.Users);
      expect(scene).toBeInstanceOf(HomeScene);
    });

    it("should create SettingScene instance for Settings scene", () => {
      const scene = SceneFactory.buildScene(SceneEnum.Settings);
      expect(scene).toBeInstanceOf(SettingScene);
    });

    it("should create PokemonScene instance for Pokemon scene", () => {
      const scene = SceneFactory.buildScene(SceneEnum.Pokemon);
      expect(scene).toBeInstanceOf(PokemonScene);
    });

    it("should throw error for unknown scene", () => {
      expect(() => {
        SceneFactory.buildScene("InvalidScene" as SceneEnum);
      }).toThrow("Unknown scene");
    });
  });
});
