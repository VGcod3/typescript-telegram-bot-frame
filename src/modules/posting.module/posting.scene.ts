import { SceneNavigator } from "../../../SceneNavigator";
import { SessionManager } from "../../../SessionManager";
import { UserSessionStorage } from "../../../SessionsStorage";
import { UserDb } from "../../db.utils/user.utils";
import { Sender } from "../sender";
import { PostingController } from "./posting.controller";
import { PostingService } from "./posting.service";

export class PostingScene {
  public static enter() {
    console.log("Posting scene entered");

    const userDb = new UserDb();
    const sender = new Sender();
    const sessions = UserSessionStorage.getInstance();
    const sessionManager = new SessionManager(sessions);
    const sceneNavigator = new SceneNavigator(sessions, sessionManager);

    const postingService = new PostingService(
      userDb,
      sender,
      sceneNavigator,
      sessionManager
    );

    new PostingController(postingService);
  }
}
