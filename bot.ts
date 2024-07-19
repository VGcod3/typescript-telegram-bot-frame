import { TelegramBot } from "typescript-telegram-bot-api";
import "dotenv/config";
import { envInit, getEnv } from "./env.setup";
import { PrismaClient } from "@prisma/client";
import { Message } from "typescript-telegram-bot-api/dist/types";

envInit();
global.ENV = getEnv();

const prisma = new PrismaClient();

const bot = new TelegramBot({ botToken: process.env.TELEGRAM_BOT_TOKEN });
bot.startPolling();

const createUser = async (
  message: NonNullable<Message & Required<Pick<Message, "text">>>
) => {
  prisma.user
    .create({
      data: {
        telegramId: message.from?.id ?? message.chat.id,
      },
    })
    .then(() => {
      bot.sendMessage({
        chat_id: message.chat.id,
        text: "User created!",
      });
    })
    .catch((error) => {
      bot.sendMessage({
        chat_id: message.chat.id,
        text: `Error: ${error.message}`,
      });
    });
};

const getUser = async (telegramId: number) => {
  return prisma.user.findUnique({
    where: {
      telegramId,
    },
  });
};

bot.on("message:text", async (message) => {
  if (message.text === "/start") {
    const user = await getUser(message.from?.id ?? message.chat.id);

    if (user) {
      bot.sendMessage({
        chat_id: message.chat.id,
        text: "Welcome back!",
      });
    } else {
      createUser(message);
    }
  }
});

bot.on("message", (message) => {
  if (message.text === "/users") {
    prisma.user.findMany().then((users) => {
      bot.sendMessage({
        chat_id: message.chat.id,
        text: `Users: ${users.length}`,
      });
    });
  }
});

bot.on("message:sticker", (message) => {
  console.log("Received sticker:", message.sticker.emoji);
  bot.sendSticker({
    chat_id: message.chat.id,
    sticker: message.sticker.file_id,
  });
});

bot.getMe().then(console.log).catch(console.error);
