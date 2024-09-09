import { TelegramBot } from "typescript-telegram-bot-api";
import { MessageType, Sender } from "../sender";
import { RegistrationService } from "./registration.service";
import { BotInstance } from "../../../BotInstance";

import { RegistrationSteps } from "./registration.service";
export class RegistrationController {
    private readonly bot: TelegramBot;

    constructor(private readonly registrationService: RegistrationService) {
        this.registrationService = registrationService;

        this.bot = BotInstance.getInstance();

        this.bot.on("message:text", async (message) => {
            await this.handleTextMessage(message)
        }

        );
    }

    public async handleTextMessage(message: MessageType) {
        console.log("Registration scene text: " + message.text);
        const chatId = message.chat.id;
        // if (message.text === "Назад") {
        //     await this.registrationService.handleKeyboard(message);
        // } else {
        //     await this.registrationService.collectData(message.chat.id);

        // }


        const currentStep = await this.registrationService.getUserStep(chatId);
        console.log("Current step: " + currentStep);
        switch (currentStep) {
            case RegistrationSteps.START:

                await this.registrationService.setUserStep(chatId, RegistrationSteps.ASK_NAME);
                break;

            case RegistrationSteps.ASK_NAME:

                await this.registrationService.setUserStep(chatId, RegistrationSteps.ASK_AGE);
                break;

            case RegistrationSteps.ASK_AGE:

                await this.registrationService.setUserStep(chatId, RegistrationSteps.FINISHED);
                break;

            // case RegistrationSteps.FINISHED:

            //     break;

            default:

                await this.registrationService.setUserStep(chatId, RegistrationSteps.START);
                break;
        }
    }
}
