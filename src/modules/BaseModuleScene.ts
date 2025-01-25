import { SceneNavigator } from "../../SceneNavigator";
import { SessionManager } from "../../SessionManager";
import { UserDb } from "../db.utils/user.utils";
import { Sender } from "./sender";

export class BaseModuleScene {
  public static initBaseModules() {
    const userDb = new UserDb();
    const sender = new Sender();

    const sessionManager = new SessionManager(userDb);
    const sceneNavigator = new SceneNavigator(sessionManager);

    return {
      userDb,
      sender,
      sessionManager,
      sceneNavigator,
    };
  }
}
