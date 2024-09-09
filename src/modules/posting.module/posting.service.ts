import { SceneNavigator } from "../../../SceneNavigator";
import { SceneEnum } from "../../../scenesList";
import { SessionManager } from "../../../SessionManager";

import { UserDb } from "../../db.utils/user.utils";
import { MessageType, Sender } from "../sender";

export class PostingService {
  constructor(
    private readonly UserDb: UserDb,
    private readonly sender: Sender,
    private readonly sceneNavigator: SceneNavigator,
    private readonly sessionManager: SessionManager
  ) {
    this.UserDb = UserDb;
    this.sender = sender;
    this.sessionManager = sessionManager;
    this.sceneNavigator = sceneNavigator;
  }

  async handlePost(message: MessageType) {
    const chatId = message.chat.id;

    await this.sessionManager.initSession(chatId);

    const users = await this.UserDb.getAllUsers();

    console.log(users);

    this.sender.sendText(chatId, users.map((user) => user.userId).join("\n"));
  }

  async handleKeyboard(message: MessageType) {
    const chatId = message.chat.id;

    const availableSceneNames =
      await this.sceneNavigator.getAvailableNextScenes(chatId);

    if (message.text === "Назад") {
      this.sceneNavigator.goBack(chatId);
    } else if (availableSceneNames.includes(message.text as SceneEnum)) {
      this.sceneNavigator.setScene(chatId, message.text as SceneEnum);
    } else {
      await this.sender.sendText(chatId, "Invalid option");
    }

    await this.sendLocalStageKeyboard(chatId);
  }

  private async sendLocalStageKeyboard(chatId: number) {
    const currentScene = await this.sceneNavigator.getCurrentScene(chatId);

    const availableScenesNames =
      await this.sceneNavigator.getAvailableNextScenes(chatId);

    const canGoBack = !!currentScene.prevScene;

    await this.sender.sendKeyboard(chatId, "Choose an option", [
      availableScenesNames.map((scene) => ({ text: scene })),

      canGoBack ? [{ text: "Назад" }] : [],
    ]);
  }
}
