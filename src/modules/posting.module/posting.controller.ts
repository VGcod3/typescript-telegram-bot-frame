import { TelegramBot } from "typescript-telegram-bot-api";
import { MessageType } from "../sender";
import { PostingService } from "./posting.service";
import { BotInstance } from "../../../BotInstance";

export class PostingController {
  private readonly bot: TelegramBot;

  constructor(private readonly postingService: PostingService) {
    this.postingService = postingService;

    this.bot = BotInstance.getInstance();

    this.bot.on("message:text", async (message) =>
      this.handleTextMessage(message)
    );
  }
  public async handleTextMessage(message: MessageType) {
    console.log(message.text);

    if (message.text === "/post") {
      this.postingService.handlePost(message);
    } else {
      this.postingService.handleKeyboard(message);
    }
  }
}
