import { SceneNavigator } from "../../SceneNavigator";
import { SessionManager } from "../../SessionManager";
import { UserDb } from "../db.utils/user.utils";
import { Sender } from "./sender";

export class BaseModuleScene {
  public readonly sender: Sender;
  public readonly userDb: UserDb;
  public readonly sessionManager: SessionManager;
  public readonly sceneManager: SceneNavigator;

  constructor() {
    this.sender = new Sender();
    this.userDb = new UserDb();

    this.sessionManager = new SessionManager(this.userDb);

    this.sceneManager = new SceneNavigator(this.sessionManager);
  }
}
