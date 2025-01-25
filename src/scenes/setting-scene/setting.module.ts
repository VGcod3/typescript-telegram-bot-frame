import { SceneEnum } from "../../enums/SceneEnum";
import { BaseScene } from "../base-scene/base.module";
import { SettingController } from "./setting.controller";
import { SettingService } from "./setting.service";

export class SettingScene extends BaseScene {
  constructor() {
    super(SceneEnum.Settings);
  }

  public enter() {
    new SettingController(new SettingService());
  }
}
