import { TelegramBot } from "typescript-telegram-bot-api";
import { BotInstance } from "../../../BotInstance";
import { MessageType } from "../sender";
import { TeamInfoService } from "./teamInfo.service";

export class TeamInfoController {
  private readonly bot: TelegramBot;

  constructor(private readonly teamInfoService: TeamInfoService) {
    this.teamInfoService = teamInfoService;

    this.bot = BotInstance.getInstance();

    this.bot.on("message:text", async (message) =>
      this.handleTextMessage(message),
    );
  }

  public async handleTextMessage(message: MessageType) {
    if (message.text === "/start") {
      await this.teamInfoService.handleStart(message);
    } else await this.teamInfoService.handleKeyboard(message);
  }
}
