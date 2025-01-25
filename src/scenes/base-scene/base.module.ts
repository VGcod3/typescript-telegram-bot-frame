import { SceneEnum } from "../../enums/SceneEnum";

export abstract class BaseScene {
  constructor(private readonly sceneName: SceneEnum) {
    console.log(`${this.sceneName} scene entered`);
  }

  abstract enter(): void;
}
