import {
  SessionStorageType,
  UserSessionStorage,
} from "./../../SessionsStorage";
import { SceneNavigator } from "../../SceneNavigator";
import { SessionManager } from "../../SessionManager";
import { UserDb } from "../db.utils/user.utils";
import { Sender } from "./sender";

export class BaseModuleScene {
  private readonly sessions: SessionStorageType;

  public readonly sender: Sender;
  public readonly userDb: UserDb;
  public readonly sessionManager: SessionManager;
  public readonly sceneManager: SceneNavigator;

  constructor() {
    this.sessions = UserSessionStorage.getInstance();

    this.sender = new Sender();
    this.userDb = new UserDb();

    this.sessionManager = new SessionManager(this.sessions);

    this.sceneManager = new SceneNavigator(this.sessions, this.sessionManager);
  }
}
