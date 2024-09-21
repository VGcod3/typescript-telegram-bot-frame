import { HomeController } from "./home.controller";

import { HomeService } from "./home.service";

export class HomeScene {
  public static enter() {
    new HomeController(new HomeService());
  }
}
