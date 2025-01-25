import { SceneEnum } from "../enums/SceneEnum";
import { BaseScene } from "../scenes/base-scene/base.module";
import { HomeScene } from "../scenes/home-scene/home.module";
import { SettingScene } from "../scenes/setting-scene/setting.module";

export class SceneFactory {
  static buildScene(sceneName: SceneEnum): BaseScene {
    switch (sceneName) {
      case SceneEnum.Home:
        return new HomeScene();
      case SceneEnum.Users:
        return new HomeScene();
      case SceneEnum.Settings:
        return new SettingScene();
      case SceneEnum.Notifications:
        return new SettingScene();
      case SceneEnum.Language:
        return new SettingScene();
      case SceneEnum.Theme:
        return new SettingScene();
      // Add cases for other scenes
      default:
        throw new Error("Unknown scene");
    }
  }
}
