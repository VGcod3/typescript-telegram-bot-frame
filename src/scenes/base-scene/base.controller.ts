import { TelegramBot } from "typescript-telegram-bot-api";
import { MessageType } from "../../modules/Sender";
import { BotInstance } from "../../modules/BotInstance";
import { BaseService } from "./base.service";
import { Logger } from "../../modules/Logger";

export abstract class BaseController<T extends BaseService> {
  protected readonly bot: TelegramBot;

  constructor(protected readonly sceneService: T) {
    this.bot = BotInstance.getInstance();
    if (!(sceneService instanceof BaseService)) {
      throw new Error("sceneService must be an instance of BaseService");
    }

    this.sceneService = sceneService;
    this.setupMessageHandler();

    this.bot.removeAllListeners();

    this.bot.on("message:text", async (message: MessageType) => {
      try {
        // Handle commands first
        if (message.text?.startsWith("/")) {
          await BotInstance.commandHandler.handle(message);
          return;
        }

        // Handle scene-specific messages
        await this.handleTextMessage(message);
      } catch (error) {
        Logger.error(`Error handling message: ${error}`, "BaseController");
      }
    });
  }

  private setupMessageHandler(): void {
    this.bot.removeAllListeners("message:text");

    this.bot.on("message:text", async (message: MessageType) => {
      try {
        // Handle commands first
        if (message.text?.startsWith("/")) {
          await BotInstance.commandHandler.handle(message);
          return;
        }

        // Handle scene-specific messages
        await this.handleTextMessage(message);
      } catch (error) {
        Logger.error(`Error handling message: ${error}`, "BaseController");
      }
    });
  }

  protected abstract handleTextMessage(message: MessageType): void;
}
