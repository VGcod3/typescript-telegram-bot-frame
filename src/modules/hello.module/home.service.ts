import { MessageType, Sender } from "../sender";
import { UserDb } from "../../db.utils/user.utils";
import { SceneNavigator } from "../../../SceneNavigator";
import { SessionManager } from "../../../SessionManager";
import { SceneEnum } from "../../../scenesList";
import {
  SessionStorageType,
  UserSessionStorage,
} from "../../../SessionsStorage";

export class HomeService {
  private readonly UserDb: UserDb;
  private readonly sender: Sender;
  private readonly sceneNavigator: SceneNavigator;
  private readonly sessionManager: SessionManager;
  private readonly sessions: SessionStorageType;

  constructor() {
    this.UserDb = new UserDb();
    this.sender = new Sender();
    this.sessions = UserSessionStorage.getInstance();

    this.sessionManager = new SessionManager(this.sessions);
    this.sceneNavigator = new SceneNavigator(
      this.sessions,
      this.sessionManager
    );
  }

  async handleStart(message: MessageType) {
    const chatId = message.chat.id;

    await this.sessionManager.initSession(chatId);

    const user = await this.UserDb.getUser(chatId);

    if (user) {
      await this.sender.sendText(chatId, "Welcome back!");
    } else {
      await this.UserDb.createUser(chatId);
      await this.sender.sendText(chatId, "Welcome, nice to see you!");
    }

    await this.sendLocalStageKeyboard(chatId);
  }

  async handleKeyboard(message: MessageType) {
    const chatId = message.chat.id;

    const availableSceneNames =
      await this.sceneNavigator.getAvailableNextScenes(chatId);

    const enumValues = Object.values(SceneEnum);

    if (message.text === "Back") {
      this.sceneNavigator.goBack(chatId);
    } else if (
      enumValues.includes(message.text as SceneEnum) &&
      availableSceneNames.includes(message.text as SceneEnum)
    ) {
      this.sceneNavigator.setScene(chatId, message.text as SceneEnum);
    } else {
      await this.sender.sendText(chatId, "Invalid option");
    }

    await this.sendLocalStageKeyboard(chatId);
  }

  async handleUsers(message: MessageType) {
    const chatId = message.chat.id;

    try {
      const users = await this.UserDb.getAllUsers();

      await this.sender.sendText(chatId, `Users: ${users.length}`);
    } catch (error) {
      await this.sender.sendText(chatId, `Error: ${error}`);
    }
  }

  private async sendLocalStageKeyboard(chatId: number) {
    const currentScene = await this.sceneNavigator.getCurrentScene(chatId);

    const availableScenesNames =
      await this.sceneNavigator.getAvailableNextScenes(chatId);

    const canGoBack = !!currentScene.prevScene;

    await this.sender.sendKeyboard(chatId, "Choose an option", [
      availableScenesNames.map((scene) => ({ text: scene })),

      canGoBack ? [{ text: "Back" }] : [],
    ]);
  }
}
