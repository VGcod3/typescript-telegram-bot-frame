import { TelegramBot } from "typescript-telegram-bot-api";
import { BotInstance } from "../../../../BotInstance";
import { MessageType } from "../../sender";
import { AdminService } from "./admin.service";

export class AdminController {
  private readonly bot: TelegramBot;

  constructor(private readonly AdminService: AdminService) {
    this.AdminService = AdminService;

    this.bot = BotInstance.getInstance();

    this.bot.on("message:text", async (message) =>
      this.handleTextMessage(message),
    );
  }

  public async handleTextMessage(message: MessageType) {
    await this.AdminService.handleKeyboard(message);
  }
}
