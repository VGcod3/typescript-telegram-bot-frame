import { MessageType } from "../../modules/Sender";
import { BotInstance } from "../../modules/BotInstance";
import { BaseService } from "./base.service";
import { Logger } from "../../modules/Logger";
import { Context } from "../../middlewares/Middleware";

export abstract class BaseController<T extends BaseService> {
  protected readonly bot: BotInstance;

  constructor(protected readonly sceneService: T) {
    this.bot = BotInstance.getInstance();
    if (!(sceneService instanceof BaseService)) {
      throw new Error("sceneService must be an instance of BaseService");
    }

    this.sceneService = sceneService;
    this.setupMessageHandler();
  }

  private setupMessageHandler(): void {
    this.bot.removeAllListeners("message:text");

    this.bot.on("message:text", async (message: MessageType) => {
      const context: Context = {
        message,
        state: new Map(),
        timestamp: Date.now(),
        chatId: message.chat.id,
      };

      try {
        await BotInstance.middlewareManager.execute(context);
        // Handle commands first
        if (message.text?.startsWith("/")) {
          await BotInstance.commandHandler.handle(message);
          return;
        }

        // Handle scene-specific messages
        await this.handleTextMessage(message);
      } catch (error) {
        Logger.error(`Error handling message: ${error}`, "BaseController");

        this.bot.sendMessage({
          chat_id: message.chat.id,
          text: "An error occurred while processing your message. Please try again later.",
        });
      }
    });
  }

  protected abstract handleTextMessage(message: MessageType): Promise<void>;
}
