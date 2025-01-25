import { SettingService } from "./setting.service";
import { MessageType } from "../../modules/Sender";
import { BaseController } from "../base-scene/base.controller";

export class SettingController extends BaseController<SettingService> {
  constructor(sceneService: SettingService) {
    super(sceneService);
  }

  public async handleTextMessage(message: MessageType) {
    this.sceneService.handleKeyboard(message);
  }
}
