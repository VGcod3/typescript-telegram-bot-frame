import { Sender } from "../Sender";
import { BotInstance } from "../BotInstance";
import { TelegramBot } from "typescript-telegram-bot-api";
import { Logger } from "../Logger";

jest.mock("typescript-telegram-bot-api");
jest.mock("../BotInstance");
jest.mock("../Logger");

describe("Sender", () => {
  let sender: Sender;
  let mockBot: jest.Mocked<TelegramBot>;

  beforeEach(() => {
    mockBot = {
      sendMessage: jest.fn(),
      sendSticker: jest.fn(),
    } as unknown as jest.Mocked<TelegramBot>;
    (BotInstance.getInstance as jest.Mock).mockReturnValue(mockBot);
    sender = new Sender();
  });

  describe("sendText", () => {
    it("should send text message successfully", async () => {
      await sender.sendText(123, "test message");
      expect(mockBot.sendMessage).toHaveBeenCalledWith({
        chat_id: 123,
        text: "test message",
      });
    });

    it("should log error when sending text fails", async () => {
      const error = new Error("Network error");
      mockBot.sendMessage.mockRejectedValueOnce(error);
      await sender.sendText(123, "test message");
      expect(Logger.error).toHaveBeenCalledWith(
        "Error sending text: Error: Network error",
        "Sender",
      );
    });
  });

  describe("sendSticker", () => {
    it("should send sticker successfully", async () => {
      await sender.sendSticker(123, "sticker-id");
      expect(mockBot.sendSticker).toHaveBeenCalledWith({
        chat_id: 123,
        sticker: "sticker-id",
      });
    });

    it("should log error when sending sticker fails", async () => {
      const error = new Error("Network error");
      mockBot.sendSticker.mockRejectedValueOnce(error);
      await sender.sendSticker(123, "sticker-id");
      expect(Logger.error).toHaveBeenCalledWith(
        "Error sending sticker: Error: Network error",
        "Sender",
      );
    });
  });

  describe("sendKeyboard", () => {
    it("should send keyboard successfully", async () => {
      const keyboard = [[{ text: "Button 1" }, { text: "Button 2" }]];
      await sender.sendKeyboard(123, "Select option", keyboard);
      expect(mockBot.sendMessage).toHaveBeenCalledWith({
        chat_id: 123,
        text: "Select option",
        reply_markup: {
          keyboard,
          one_time_keyboard: true,
          resize_keyboard: true,
        },
      });
    });

    it("should log error when sending keyboard fails", async () => {
      const error = new Error("Network error");
      mockBot.sendMessage.mockRejectedValueOnce(error);
      const keyboard = [[{ text: "Button 1" }]];
      await sender.sendKeyboard(123, "Select option", keyboard);
      expect(Logger.error).toHaveBeenCalledWith(
        "Error sending keyboard: Error: Network error",
        "Sender",
      );
    });
  });
});
