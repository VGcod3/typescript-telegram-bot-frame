import { TelegramBot } from "typescript-telegram-bot-api";
import { HomeService } from "./home.service";
import { BotInstance } from "../../../BotInstance";
import { MessageType } from "../sender";

export class HomeController {
  private readonly bot: TelegramBot;

  constructor(private readonly homeService: HomeService) {
    this.homeService = homeService;

    this.bot = BotInstance.getInstance();

    this.bot.on("message:text", async (message) =>
      this.handleTextMessage(message)
    );
  }

  public async handleTextMessage(message: MessageType) {

    if (message.text === "/start") {
      this.homeService.handleStart(message);
    }
    else if(message.text === "Про бест"){
      this.homeService.handleAboutBest(message);
    }
    else if (message.text === "Про івент") {
      this.homeService.handleAboutCTF(message);
    }
    else {
      this.homeService.handleKeyboard(message);
    }
  }
}
