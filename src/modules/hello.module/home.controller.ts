import { TelegramBot } from "typescript-telegram-bot-api";
import { HomeService } from "./home.service";
import { BotInstance } from "../../../BotInstance";
import { MessageType } from "../sender";

export class HomeController {
  private readonly bot: TelegramBot;

  constructor(private readonly helloService: HomeService) {
    this.helloService = helloService;

    this.bot = BotInstance.getInstance();

    this.bot.on("message:text", async (message) =>
      this.handleTextMessage(message)
    );
  }

  public async handleTextMessage(message: MessageType) {
    if (message.text === "/start") {
      this.helloService.handleStart(message);
    } else {
      this.helloService.handleKeyboard(message);

      if (message.text === "/users") {
        this.helloService.handleUsers(message);
      }
    }
  }
}
