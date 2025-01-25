import { BaseModuleScene } from "../BaseModuleScene";
import { HomeController } from "./home.controller";
import { HomeService } from "./home.service";

export class HomeScene implements BaseModuleScene {
  public static enter() {
    console.log("Home scene entered");

    const { userDb, sender, sessionManager, sceneNavigator } =
      BaseModuleScene.initBaseModules();

    const homeService = new HomeService(
      userDb,
      sender,
      sceneNavigator,
      sessionManager,
    );

    new HomeController(homeService);
  }
}
