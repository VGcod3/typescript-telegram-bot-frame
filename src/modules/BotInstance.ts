import { TelegramBot } from "typescript-telegram-bot-api";
import { CommandHandler } from "../commands/CommandHandler";
import { MiddlewareManager } from "../middlewares/MiddlewareManager";
import { rateLimitMiddleware } from "../middlewares/RateLimitter";
import { StartCommand } from "../commands/StartCommand";

export class BotInstance extends TelegramBot {
  private static instance: TelegramBot;
  public static middlewareManager: MiddlewareManager;
  public static commandHandler: CommandHandler;

  public static getInstance(): TelegramBot {
    if (!BotInstance.instance) {
      BotInstance.instance = new TelegramBot({
        botToken: process.env.TELEGRAM_BOT_TOKEN,
      });

      this.commandHandler = new CommandHandler();
      this.registerCommands();

      this.middlewareManager = new MiddlewareManager();
      this.registerMiddleware();
    }
    return BotInstance.instance;
  }

  private static registerCommands(): void {
    const commands = [
      new StartCommand(),
      // Add more commands here
    ];

    commands.forEach((command) => {
      this.commandHandler.register(command);
    });
  }

  private static registerMiddleware(): void {
    // this.middlewareManager.use(loggingMiddleware);
    this.middlewareManager.use(rateLimitMiddleware);
    // Add more middleware here
  }
}
