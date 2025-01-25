import { TelegramBot } from "typescript-telegram-bot-api";
import { UpdateType } from "typescript-telegram-bot-api/dist/types";

export class BotInstance extends TelegramBot {
  private static instance: TelegramBot;

  constructor(options: {
    botToken: string;
    testEnvironment?: boolean;
    baseURL?: string;
    autoRetry?: boolean;
    autoRetryLimit?: number;
    allowedUpdates?: UpdateType[];
    pollingTimeout?: number;
  }) {
    super(options);
  }

  public static getInstance(): TelegramBot {
    if (!BotInstance.instance) {
      BotInstance.instance = new TelegramBot({
        botToken: process.env.TELEGRAM_BOT_TOKEN,
      });
    }
    return BotInstance.instance;
  }
}
