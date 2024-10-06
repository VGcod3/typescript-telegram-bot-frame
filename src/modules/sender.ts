import { TelegramBot } from "typescript-telegram-bot-api";
import { BotInstance } from "../../BotInstance";
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
    await this.bot.sendMessage({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    });
  }
  async sendTextMARKDOWN(
    chatId: number,
    text: string,
    one_time_keyboard = false,
  ) {
    await this.bot.sendMessage({
      chat_id: chatId,
      text,
      parse_mode: "MarkdownV2",
    });
  }
  async sendSticker(chatId: number, sticker: string) {
    await this.bot.sendSticker({
      chat_id: chatId,
      sticker,
    });
  }

  async sendKeyboardHTML(
    chatId: number,
    text: string,
    keyboard: KeyboardButton[][],
    one_time_keyboard = false,
  ) {
    await this.bot.sendMessage({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      reply_markup: {
        keyboard,
        one_time_keyboard: one_time_keyboard,
        resize_keyboard: true,
      },
    });
  }

  async sendKeyboardMARKDOWN(
    chatId: number,
    text: string,
    keyboard: KeyboardButton[][],
    one_time_keyboard = false,
  ) {
    await this.bot.sendMessage({
      chat_id: chatId,
      text,
      parse_mode: "MarkdownV2",
      reply_markup: {
        keyboard,
        one_time_keyboard: one_time_keyboard,
        resize_keyboard: true,
      },
    });
  }

}
