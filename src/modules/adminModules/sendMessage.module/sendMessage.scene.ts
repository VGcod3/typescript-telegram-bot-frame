import { SendMessageController } from "./sendMessage.controller";
import { SendMessageService } from "./sendMessage.service";

export class SendMessageScene {
  public static enter() {
    console.log("SendMessage Scene entered");

    new SendMessageController(new SendMessageService());
  }
}
