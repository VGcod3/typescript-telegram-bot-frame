import { TelegramBot } from "typescript-telegram-bot-api";
import { BotInstance } from "../../../../BotInstance";
import { MessageType } from "../../sender";
import { SendMessageService } from "./sendMessage.service";
import { Message } from "typescript-telegram-bot-api/dist/types";

export class SendMessageController {
  private readonly bot: TelegramBot;

  constructor(private readonly SendMessageService: SendMessageService) {
    this.SendMessageService = SendMessageService;

    this.bot = BotInstance.getInstance();

    this.bot.on("message", async (message) => this.handleTextMessage(message));
  }

  public async handleTextMessage(message: Message) {
    await this.SendMessageService.handleKeyboard(message);
  }
}
