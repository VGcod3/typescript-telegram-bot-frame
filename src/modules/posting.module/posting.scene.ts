import { SceneNavigator } from "../../../SceneNavigator";
import { SessionManager } from "../../../SessionManager";
import { UserDb } from "../../db.utils/user.utils";
import { Sender } from "../sender";
import { PostingController } from "./posting.controller";
import { PostingService } from "./posting.service";

export class PostingScene {
  public static enter() {

    const userDb = new UserDb();
    const sender = new Sender();

    const sessionManager = new SessionManager(userDb);
    const sceneNavigator = new SceneNavigator(sessionManager);

    const postingService = new PostingService(
      userDb,
      sender,
      sceneNavigator,
      sessionManager
    );

    new PostingController(postingService);
  }
}
