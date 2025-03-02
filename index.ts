import "dotenv/config";
import { BotInstance } from "./src/modules/BotInstance";
import { getEnv, envInit } from "./env.setup";
import { SceneFactory } from "./src/modules/SceneFactory";
import { SceneEnum } from "./src/enums/SceneEnum";

envInit();
global.ENV = getEnv();

const botInit = () => {
  const bot = BotInstance.getInstance();
  bot.startPolling();

  SceneFactory.buildScene(SceneEnum.Home).enter();

  // const homeScene = new SettingScene();

  // homeScene.enter();
};

botInit();
