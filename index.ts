import dotenv from "dotenv-flow";
dotenv.config();
import { BotInstance } from "./src/modules/BotInstance";
import { getEnv, envInit } from "./env.setup";
import { SceneFactory } from "./src/modules/SceneFactory";
import { SceneEnum } from "./src/enums/SceneEnum";
import { Logger } from "./src/modules/Logger";

async function bootstrap() {
  try {
    // Initialize environment
    envInit();
    global.ENV = getEnv();

    // Get bot instance
    const bot = BotInstance.getInstance();

    // Start bot
    bot.startPolling();

    // Initialize first scene
    SceneFactory.buildScene(SceneEnum.Home).enter();

    Logger.info("Bot successfully started");
  } catch (error) {
    Logger.error(`Failed to start bot: ${error}`, "Bootstrap");
    process.exit(1);
  }
}

bootstrap();
