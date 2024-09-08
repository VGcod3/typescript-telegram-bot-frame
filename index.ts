import "dotenv/config";
import { envInit, getEnv } from "./env.setup";
import { BotInstance } from "./BotInstance";
import { HomeScene } from "./src/modules/hello.module/home.scene";

envInit();
global.ENV = getEnv();

const botInit = () => {
  const bot = BotInstance.getInstance();
  bot.startPolling();

  // bot.getMe().then(console.log).catch(console.error);

  HomeScene.enter();
};

botInit();
