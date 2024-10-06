import { TelegramBot } from "typescript-telegram-bot-api";
import { BotInstance } from "../../../BotInstance";
import { MessageType } from "../sender";
import { TeamJoinService } from "./teamJoin.service";

export class TeamJoinController {
  private readonly bot: TelegramBot;

  constructor(private readonly teamJoinService: TeamJoinService) {
    this.teamJoinService = teamJoinService;

    this.bot = BotInstance.getInstance();

    this.bot.on("message:text", async (message) =>
      this.handleTextMessage(message),
    );
  }

  public async handleTextMessage(message: MessageType) {
    if (message.text === "/start") {
      await this.teamJoinService.handleStart(message);
    } else {
      await this.teamJoinService.handleKeyboard(message);
    }
  }
}
