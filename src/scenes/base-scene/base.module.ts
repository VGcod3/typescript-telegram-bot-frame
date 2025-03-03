import { SceneEnum } from "../../enums/SceneEnum";
import { Logger } from "../../modules/Logger";

export abstract class BaseScene {
  constructor(private readonly sceneName: SceneEnum) {
    Logger.log(`${this.sceneName} scene created`);
  }

  abstract enter(): void;
}
