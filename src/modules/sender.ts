import { TelegramBot } from "typescript-telegram-bot-api";
import { BotInstance } from "../../BotInstance";
import {
  KeyboardButton,
  Message,
} from "typescript-telegram-bot-api/dist/types";
import * as fs from "fs";
import path from "path";

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
  async sendPhoto(chatId: number, filePath: string, caption?: string) {
    // Use __dirname to ensure you're working within the project folder
    const relativeFilePath = path.join(__dirname, filePath); // This will work with your project folder

    // Check if the file exists before proceeding
    if (!fs.existsSync(relativeFilePath)) {
      throw new Error(`File not found: ${relativeFilePath}`);
    }

    // Create a stream for the file and send it via the bot
    const photoStream = fs.createReadStream(relativeFilePath);

    await this.bot.sendPhoto({
      chat_id: chatId,
      photo: photoStream, // Pass the file stream
      caption: caption,
      parse_mode: "HTML",
    });
  }
  async sendPhotoWithKeyBoard(
    chatId: number,
    filePath: string,
    caption: string,
    KeyboardButtons: KeyboardButton[][],
  ) {
    const relativeFilePath = path.join(__dirname, filePath); // This will work with your project folder

    // Check if the file exists before proceeding
    if (!fs.existsSync(relativeFilePath)) {
      throw new Error(`File not found: ${relativeFilePath}`);
    }

    // Create a stream for the file and send it via the bot
    const photoStream = fs.createReadStream(relativeFilePath);

    await this.bot.sendPhoto({
      chat_id: chatId,
      photo: photoStream, // Pass the file stream
      caption: caption,
      parse_mode: "HTML",
      reply_markup: {
        keyboard: KeyboardButtons,
        resize_keyboard: true,
        one_time_keyboard: false,
      },
    });
  }

  async sendPhotoHTML(
    chatId: number,
    caption: string,
    filePath?: string,
    photoId?: string,
  ) {
    if (filePath !== undefined) {
      const relativeFilePath = path.join(__dirname, filePath); // Ensure you're working within the project folder

      // Check if the file exists before proceeding
      if (!fs.existsSync(relativeFilePath)) {
        throw new Error(`File not found: ${relativeFilePath}`);
      }

      // Create a stream for the file and send it via the bot
      const photoStream = fs.createReadStream(relativeFilePath);

      await this.bot.sendPhoto({
        chat_id: chatId,
        photo: photoStream, // Pass the file stream
        caption: caption,
        parse_mode: "HTML", // Use HTML for formatting
      });
    } else if (photoId !== undefined) {
      await this.bot.sendPhoto({
        chat_id: chatId,
        photo: photoId, // Pass the file stream
        caption: caption,
        parse_mode: "HTML", // Use HTML for formatting
      });
    }
  }
  async sendPhotoMarkdown(
    chatId: number,
    caption: string,
    filePath: string,
    photoId?: string,
  ) {
    if (filePath !== undefined) {
      const relativeFilePath = path.join(__dirname, filePath); // Ensure you're working within the project folder

      // Check if the file exists before proceeding
      if (!fs.existsSync(relativeFilePath)) {
        throw new Error(`File not found: ${relativeFilePath}`);
      }

      // Create a stream for the file and send it via the bot
      const photoStream = fs.createReadStream(relativeFilePath);

      await this.bot.sendPhoto({
        chat_id: chatId,
        photo: photoStream, // Pass the file stream
        caption: caption,
        parse_mode: "MarkdownV2", // Use HTML for formatting
      });
    } else if (photoId !== undefined) {
      await this.bot.sendPhoto({
        chat_id: chatId,
        photo: photoId, // Pass the file stream
        caption: caption,
        parse_mode: "MarkdownV2", // Use HTML for formatting
      });
    }
  }
}
