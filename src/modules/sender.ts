import { TelegramBot } from "typescript-telegram-bot-api";
import { BotInstance } from "./BotInstance";
import {
  KeyboardButton,
  Message,
} from "typescript-telegram-bot-api/dist/types";
import { Logger } from "./Logger";

export type MessageType = NonNullable<
  Message & Required<Pick<Message, "text">>
>;

export class Sender {
  private bot: TelegramBot;

  constructor() {
    this.bot = BotInstance.getInstance();
  }

  async sendText(chatId: number, text: string) {
    try {
      await this.bot.sendMessage({
        chat_id: chatId,
        text,
      });
    } catch (error) {
      Logger.error(`Error sending text: ${error}`, "Sender");
    }
  }

  async sendSticker(chatId: number, sticker: string) {
    try {
      await this.bot.sendSticker({
        chat_id: chatId,
        sticker,
      });
    } catch (error) {
      Logger.error(`Error sending sticker: ${error}`, "Sender");
    }
  }

  async sendKeyboard(
    chatId: number,
    text: string,
    keyboard: KeyboardButton[][],
  ) {
    try {
      await this.bot.sendMessage({
        chat_id: chatId,
        text,
        reply_markup: {
          keyboard,
          one_time_keyboard: true,
          resize_keyboard: true,
        },
      });
    } catch (error) {
      Logger.error(`Error sending keyboard: ${error}`, "Sender");
    }
  }
}
