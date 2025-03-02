import { HomeService } from "./home.service";
import { MessageType } from "../../modules/Sender";
import { BaseController } from "../base-scene/base.controller";

export class HomeController extends BaseController<HomeService> {
  constructor(sceneService: HomeService) {
    super(sceneService);
  }

  protected async handleTextMessage(message: MessageType) {
    if (message.text === "/start") {
      this.sceneService.handleStart(message);
    } else {
      this.sceneService.handleKeyboard(message);

      if (message.text === "👥 Users") {
        this.sceneService.handleUsers(message);
      }
    }
  }
}
