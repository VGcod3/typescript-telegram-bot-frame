import "dotenv/config";
import { envInit, getEnv } from "./env.setup";
import { BotInstance } from "./BotInstance";
import { HomeScene } from "./src/modules/hello.module/home.scene";
import { UserDb } from "./src/db.utils/user.utils";

envInit();
global.ENV = getEnv();

const botInit = () => {
  const bot = BotInstance.getInstance();
  bot.startPolling();

  // bot.getMe().then(console.log).catch(console.error);
  // const teamMember = await this.UserDb.getTeamMember(chatId);
  // if (teamMember) {
  //   await this.sender.sendText(chatId, "Радий знову тебе бачити!");
  //   await this.sceneNavigator.setScene(chatId, SceneEnum.Team);
  // }
  
  HomeScene.enter();
};

botInit();
