import { TelegramBot } from "typescript-telegram-bot-api";
import { BotInstance } from "../../../BotInstance";
import { MessageType } from "../sender";
import { TeamHandleService } from "./teamHandle.service";

export class TeamHandleController {
  private readonly bot: TelegramBot;

  constructor(private readonly teamHandleService: TeamHandleService) {
    this.teamHandleService = teamHandleService;

    this.bot = BotInstance.getInstance();

    this.bot.on("message:text", async (message) =>
      this.handleTextMessage(message),
    );
  }

  public async handleTextMessage(message: MessageType) {
    this.teamHandleService.handleKeyboard(message);
  }
}
