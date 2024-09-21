import { TelegramBot } from "typescript-telegram-bot-api";
import { BotInstance } from "../../../BotInstance";
import { MessageType } from "../sender";
import { TeamCreateService } from "./teamCreate.service";

export class TeamCreateController {
  private readonly bot: TelegramBot;

  constructor(private readonly teamCreateService: TeamCreateService) {
    this.teamCreateService = teamCreateService;

    this.bot = BotInstance.getInstance();

    this.bot.on("message:text", async (message) =>
      this.handleTextMessage(message),
    );
  }

  public async handleTextMessage(message: MessageType) {
    this.teamCreateService.handleKeyboard(message);
  }
}
