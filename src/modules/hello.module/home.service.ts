import { MessageType, Sender } from "../sender";
import { UserDb } from "../../db.utils/user.utils";
import { SceneNavigator } from "../../../SceneNavigator";
import { SessionManager } from "../../../SessionManager";
import { SceneEnum } from "../../../scenesList";
import { aboutBestText, aboutEventText, startMessage } from "../../sharedText";

export class HomeService {
  private readonly UserDb: UserDb;
  private readonly sender: Sender;
  private readonly sceneNavigator: SceneNavigator;
  private readonly sessionManager: SessionManager;

  constructor() {
    this.UserDb = new UserDb();
    this.sender = new Sender();

    this.sessionManager = new SessionManager(this.UserDb);
    this.sceneNavigator = new SceneNavigator(this.sessionManager);
  }

  async handleStart(message: MessageType) {
    const chatId = message.chat.id;

    await this.sessionManager.initSession(chatId);

    const user = await this.UserDb.getUser(chatId);
    const teamMember = await this.UserDb.getTeamMember(chatId);
    if (teamMember) {
      await this.sender.sendText(chatId, "Радий знову тебе бачити!");
      await this.sceneNavigator.setScene(chatId, SceneEnum.Team);
    }
    else if (user) {
      await this.sender.sendText(chatId, "Радий знову тебе бачити!");

    } else {
      await this.UserDb.createUser(chatId);
      await this.sender.sendText(chatId, "Ласкаво просимо, студенте!");
    }


    await this.sendLocalStageKeyboard(chatId, startMessage);
  }
  async handleAboutBest(message: MessageType) {
    const chatId = message.chat.id;
    this.sender.sendText(chatId, aboutBestText)
  }
  handleAboutCTF(message: MessageType) {
    const chatId = message.chat.id;
    this.sender.sendText(chatId, aboutEventText)
  }
  async handleKeyboard(message: MessageType) {
    const chatId = message.chat.id;

    const availableSceneNames =
      await this.sceneNavigator.getAvailableNextScenes(chatId);
    console.log("Home Available scenes: " + availableSceneNames);
    console.log("Home Entered text: " + message.text);

    if (message.text === "Назад") {
      this.sceneNavigator.goBack(chatId);
    } else if (availableSceneNames.includes(message.text as SceneEnum)) {
      if (message.text !== "Реєстрація") {
        this.sceneNavigator.setScene(chatId, message.text as SceneEnum);
      }
      if (message.text === "Реєстрація" && await this.UserDb.getTeamMember(chatId) === null) {
        this.sceneNavigator.setScene(chatId, message.text as SceneEnum);
        this.sender.sendKeyboard(chatId, "Перед початком реєстрації підтвердьте дозвіл на обробку ваших даних", [
          [{ text: "Почати реєстрацію" }],
          [{ text: "Назад" }]
        ], true);
      }
    } else {
      await this.sender.sendText(chatId, "Такого варіанту не існує");
      await this.sendLocalStageKeyboard(chatId, startMessage);
    }

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
  private chunkArray<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }
  private async sendLocalStageKeyboard(chatId: number, text: string) {
    const currentScene = await this.sceneNavigator.getCurrentScene(chatId);

    const availableScenesNames =
      await this.sceneNavigator.getAvailableNextScenes(chatId);

    const scenesButtons = availableScenesNames.map((scene) => ({ text: scene }));

    // Split buttons into groups of two per row
    const keyboardButtons = this.chunkArray(scenesButtons, 2);

    // const canGoBack = !!currentScene.prevScene;
    // if (canGoBack) {
    //   keyboardButtons.push([{ text: "Назад" }]);
    // }


    await this.sender.sendKeyboard(chatId, text, keyboardButtons);
  }
}
