import { TelegramBot } from "typescript-telegram-bot-api";
import { MessageType } from "../sender";
import { RegistrationService } from "./registration.service";
import { BotInstance } from "../../../BotInstance";
import { BACK } from "../../sharedText";

export class RegistrationController {
  private readonly bot: TelegramBot;

  constructor(private readonly registrationService: RegistrationService) {
    this.registrationService = registrationService;

    this.bot = BotInstance.getInstance();

    this.bot.on("message:text", async (message) => {
      this.handleTextMessage(message);
    });
    this.bot.on("message:contact", async (message) => {
      this.registrationService.handlePhoneNumber(message);
    });
  }

  public async handleTextMessage(message: MessageType) {
    if (message.text === "/start") {
      this.registrationService.handleStart(message);
    } else if (message.text !== BACK) {
      this.registrationService.handleRegistration(message);
    } else {
      this.registrationService.handleKeyboard(message);
    }
  }
}
