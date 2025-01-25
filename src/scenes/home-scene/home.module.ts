import { SceneEnum } from "../../enums/SceneEnum";
import { BaseScene } from "../base-scene/base.module";
import { HomeController } from "./home.controller";
import { HomeService } from "./home.service";

export class HomeScene extends BaseScene {
  constructor() {
    super(SceneEnum.Home);
  }

  public enter() {
    new HomeController(new HomeService());
  }
}
