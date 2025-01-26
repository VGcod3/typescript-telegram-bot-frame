import { TelegramBot } from "typescript-telegram-bot-api";
import { BotInstance } from "./BotInstance";
import {
  KeyboardButton,
  Message,
} from "typescript-telegram-bot-api/dist/types";

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
      console.error(error);
    }
  }

  async sendSticker(chatId: number, sticker: string) {
    try {
      await this.bot.sendSticker({
        chat_id: chatId,
        sticker,
      });
    } catch (error) {
      console.error(error);
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
      console.error(error);
    }
  }
}
