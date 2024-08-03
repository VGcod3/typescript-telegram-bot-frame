import { HomeController } from "./home.controller";

import { HomeService } from "./home.service";

export class HomeScene {
  public static enter() {
    console.log("Home scene entered");

    new HomeController(new HomeService());
  }
}
