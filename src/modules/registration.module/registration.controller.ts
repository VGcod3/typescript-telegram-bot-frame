import { TelegramBot } from "typescript-telegram-bot-api";
import { MessageType } from "../sender";
import { RegistrationService } from "./registration.service";
import { BotInstance } from "../../../BotInstance";

export class RegistrationController {
    private readonly bot: TelegramBot;

    constructor(private readonly registrationService: RegistrationService) {
        this.registrationService = registrationService;

        this.bot = BotInstance.getInstance();

        this.bot.on("message:text", async (message) =>
            this.handleTextMessage(message)
        );
    }
    public async handleTextMessage(message: MessageType) {
        console.log("Text in registration scene: " + message.text);

        if (message.text === "Back") {
            this.registrationService.handleKeyboard(message);
        } else {
            this.registrationService.handleRegistration(message);
    
        }
    }
}
