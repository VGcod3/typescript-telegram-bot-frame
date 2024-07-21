import { HomeService } from "./home.service";
import { HomeController } from "./home.controller";
import { UserDb } from "../../db.utils/user.utils";
import { Sender } from "../sender";
import { SceneNavigator } from "../../../SceneNavigator";
import { SessionType } from "../../..";
import { SessionManager } from "../../../SessionManager";

export class HomeScene {
  constructor(private readonly sessions: SessionType) {
    this.enter();
  }

  private async enter() {
    const sender = new Sender();
    const userDb = new UserDb();

    const sessionManager = new SessionManager(this.sessions);

    const sceneManager = new SceneNavigator(this.sessions, sessionManager);

    new HomeController(
      new HomeService(userDb, sender, sceneManager, sessionManager)
    );
  }
}
