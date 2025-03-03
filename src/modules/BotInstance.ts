import { TelegramBot } from "typescript-telegram-bot-api";
import { CommandHandler } from "../commands/CommandHandler";
import { StartCommand } from "./StartCommand";

export class BotInstance extends TelegramBot {
  private static instance: TelegramBot;
  public static commandHandler: CommandHandler;

  public static getInstance(): TelegramBot {
    if (!BotInstance.instance) {
      BotInstance.instance = new TelegramBot({
        botToken: process.env.TELEGRAM_BOT_TOKEN,
      });

      this.commandHandler = new CommandHandler();
      this.registerCommands();
    }
    return BotInstance.instance;
  }

  private static registerCommands(): void {
    const commands = [
      new StartCommand(),
      // Add more commands here
    ];

    commands.forEach((command) => {
      BotInstance.commandHandler.register(command);
    });
  }
}
