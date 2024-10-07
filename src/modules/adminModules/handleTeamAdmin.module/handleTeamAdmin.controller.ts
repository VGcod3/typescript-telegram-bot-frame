import { TelegramBot } from "typescript-telegram-bot-api";
import { BotInstance } from "../../../../BotInstance";
import { MessageType } from "../../sender";
import { HandleTeamAdminService } from "./handleTeamAdmin.service";

export class HandleTeamAdminController {
  private readonly bot: TelegramBot;

  constructor(private readonly HandleTeamAdminService: HandleTeamAdminService) {
    this.HandleTeamAdminService = HandleTeamAdminService;

    this.bot = BotInstance.getInstance();

    this.bot.on("message:text", async (message) =>
      this.handleTextMessage(message),
    );
  }

  public async handleTextMessage(message: MessageType) {
    await this.HandleTeamAdminService.handleKeyboard(message);
  }
}
