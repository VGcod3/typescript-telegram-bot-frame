import { TelegramBot } from "typescript-telegram-bot-api";
import { MessageType, Sender } from "../sender";
import { RegistrationService } from "./registration.service";
import { BotInstance } from "../../../BotInstance";

export class RegistrationController {
  private readonly bot: TelegramBot;

  constructor(private readonly registrationService: RegistrationService) {
    this.registrationService = registrationService;

    this.bot = BotInstance.getInstance();

    this.bot.on("message:text", async (message) => {
      await this.handleTextMessage(message);
    }
    );
  }

  public async handleTextMessage(message: MessageType) {
    if (message.text !== "Назад") {
      this.registrationService.collectData(message);
    }
    else {
      this.registrationService.handleKeyboard(message);
    }
  }
}
