import { BaseModuleScene } from "../BaseModuleScene";
import { PostingController } from "./posting.controller";
import { PostingService } from "./posting.service";

export class PostingScene implements BaseModuleScene {
  public static enter() {
    console.log("Posting scene entered");

    const { userDb, sender, sessionManager, sceneNavigator } =
      BaseModuleScene.initBaseModules();

    const postingService = new PostingService(
      userDb,
      sender,
      sceneNavigator,
      sessionManager,
    );

    new PostingController(postingService);
  }
}
