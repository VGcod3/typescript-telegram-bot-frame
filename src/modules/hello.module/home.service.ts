import { MessageType, Sender } from "../sender";
import { UserDb } from "../../db.utils/user.utils";
import { SceneNavigator } from "../../../SceneNavigator";
import { SessionManager } from "../../../SessionManager";
import { SceneEnum } from "../../../scenesList";
import { aboutBestText, aboutChatText, aboutEventText, locationText, rulesText, startMessage, testTaskText } from "../../sharedText";

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

    if (teamMember || user) {
      await this.sender.sendText(chatId, "Радий знову тебе бачити!");
    } else {
      await this.UserDb.createUser(chatId);
      await this.sender.sendText(chatId, "Ласкаво просимо, студенте!");
    }

    await this.sendLocalStageKeyboard(chatId, startMessage);
  }

  async handleKeyboard(message: MessageType) {
    const chatId = message.chat.id;
    const teamMember = await this.UserDb.getTeamMember(chatId);
    const availableScenes = await this.sceneNavigator.getAvailableNextScenes(chatId, teamMember);
    const enteredText = message.text;
  
    if (enteredText === "Назад") {
      await this.sceneNavigator.goBack(chatId);
    }
  
    if (!availableScenes.includes(enteredText as SceneEnum)) {
      await this.sender.sendText(chatId, "Такого варіанту не існує");
      await this.sendLocalStageKeyboard(chatId, startMessage);
    }
  
    if (enteredText === "Реєстрація" && !teamMember) {
      await this.handleRegistration(chatId);
    }
    await this.sceneNavigator.setScene(chatId, enteredText as SceneEnum);
  
    if (teamMember) {
      await this.handleSceneByText(enteredText, message);
    }
  }
  
  private async handleRegistration(chatId: number) {
    this.sceneNavigator.setScene(chatId, "Реєстрація" as SceneEnum);
    return this.sender.sendKeyboard(
      chatId,
      "Перед початком реєстрації підтвердьте дозвіл на обробку ваших даних",
      [[{ text: "Почати реєстрацію" }], [{ text: "Назад" }]],
      true
    );
  }
  
  private handleSceneByText(text: string, message: MessageType) {
    switch (text) {
      case "Місце проведення":
        return this.handleLocation(message);
      case "Правила івенту":
        return this.handleRules(message);
      case "Тестове завдання":
        return this.handleTestTask(message);
      case "Чат":
        return this.handleChat(message);
      case "Інформація про команду":
        return this.handleTeam(message);
      default:
        break;
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
    const teamMember = await this.UserDb.getTeamMember(chatId);

    const availableScenesNames =
      await this.sceneNavigator.getAvailableNextScenes(chatId, teamMember);

    const scenesButtons = availableScenesNames.map((scene) => ({
      text: scene,
    }));

    const canGoBack = !!currentScene.prevScene;
    const allButtons = canGoBack
      ? [...scenesButtons, { text: "Назад" }]
      : scenesButtons;

    const keyboardButtons = this.chunkArray(allButtons, 2);
    await this.sender.sendKeyboard(chatId, text, keyboardButtons);
  }

  handleAboutBest(message: MessageType) {
    const chatId = message.chat.id;
    this.sender.sendText(chatId, aboutBestText);
  }
  handleAboutCTF(message: MessageType) {
    const chatId = message.chat.id;
    this.sender.sendText(chatId, aboutEventText);
  }
  handleLocation(message: MessageType) {
    const chatId = message.chat.id;
    this.sender.sendText(chatId, locationText);
  }
  handleChat(message: MessageType) {
    const chatId = message.chat.id;
    this.sender.sendText(chatId, aboutChatText);
  }
  handleTestTask(message: MessageType) {
    const chatId = message.chat.id;
    this.sender.sendText(chatId, testTaskText);
  }

  handleRules(message: MessageType) {
    const chatId = message.chat.id;
    this.sender.sendText(chatId, rulesText);
  }

  async handleTeam(message: MessageType) {
    const chatId = message.chat.id;
    const team = await this.UserDb.getTeamMember(chatId);
    if (team?.teamId === null) {
      this.sender.sendText(chatId, "Ви ще не в команді");
      // await this.sceneNavigator.setScene(chatId, SceneEnum.NewTeam);
      await this.sendLocalStageKeyboard(chatId, "Виберіть дію");
    }
  }
}
