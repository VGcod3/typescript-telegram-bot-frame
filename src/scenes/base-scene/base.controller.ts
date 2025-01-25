import { TelegramBot } from "typescript-telegram-bot-api";
import { MessageType } from "../../modules/Sender";
import { BotInstance } from "../../modules/BotInstance";
import { BaseService } from "./base.service";

export abstract class BaseController<T extends BaseService> {
  private readonly bot: TelegramBot;

  constructor(protected readonly sceneService: T) {
    this.bot = BotInstance.getInstance();
    if (!(sceneService instanceof BaseService)) {
      throw new Error("sceneService must be an instance of BaseService");
    }

    this.sceneService = sceneService;

    this.bot.removeAllListeners();

    this.bot.on("message:text", async (message) => {
      this.handleTextMessage(message);
    });
  }

  public abstract handleTextMessage(message: MessageType): void;
}
