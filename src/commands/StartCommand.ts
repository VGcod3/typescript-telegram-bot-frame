import { SessionManager } from "../modules/SessionManager";
import { Command } from "./Command";
import { MessageType, Sender } from "../modules/Sender";
import { UserDb } from "../db/user.db";

import { SceneNavigator } from "../modules/SceneNavigator";

export class StartCommand implements Command {
  public name = "/start";
  public description = "Start the bot";

  private userDb = new UserDb();
  private sender = new Sender();
  private sessionManager = new SessionManager(this.userDb);
  private sceneNavigator = new SceneNavigator(this.sessionManager);

  async execute(message: MessageType): Promise<void> {
    const chatId = message.chat.id;
    const user = await this.userDb.getUser(chatId);

    const sessionData = this.sessionManager.initSession(chatId);

    if (user) {
      await this.sender.sendText(
        chatId,
        "Welcome back! 🎮\nContinue your Pokemon journey!",
      );
    } else {
      await this.userDb.createUser(chatId);
      await this.sender.sendText(
        chatId,
        "Welcome to Pokemon Bot! 🎮\nUse keyboard to see available commands.",
      );
    }

    await this.sceneNavigator.sendStagenavigationKeyboard(chatId, this.sender);

    await this.sessionManager.pushSessionData(chatId, sessionData);
  }
}
