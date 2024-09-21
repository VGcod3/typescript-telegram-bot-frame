import { MessageType, Sender } from "../sender";
import { UserDb } from "../../db.utils/user.utils";
import { SceneNavigator } from "../../../SceneNavigator";
import { SessionManager } from "../../../SessionManager";
import { SceneEnum } from "../../../scenesList";
import {
  aboutBestText,
  aboutChatText,
  aboutEventText,
  BACK,
  locationText,
  rulesText,
  startMessage,
  testTaskText,
} from "../../sharedText";
import { prisma } from "../../db.utils/prisma.client";
import { JsonObject } from "@prisma/client/runtime/library";
import { Prisma } from "@prisma/client";

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
    const availableScenes = await this.sceneNavigator.getAvailableNextScenes(
      chatId,
      teamMember,
    );
    const enteredText = message.text;

    if (enteredText === BACK) {
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
      [[{ text: "Почати реєстрацію" }], [{ text: BACK }]],
      true,
    );
  }

  private async handleSceneByText(text: string, message: MessageType) {
    switch (text) {
      case "Місце проведення":
        this.handleLocation(message);
        break;
      case "Правила івенту":
        this.handleRules(message);
        break;
      case "Тестове завдання":
        this.handleTestTask(message);
        break;
      case "Чат":
        this.handleChat(message);
        break;
      case "Інформація про команду":
        await this.handleTeam(message);
        break;
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
      ? [...scenesButtons, { text: BACK }]
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
  private handleLocation(message: MessageType) {
    const chatId = message.chat.id;
    this.sender.sendText(chatId, locationText);
  }
  private handleChat(message: MessageType) {
    const chatId = message.chat.id;
    this.sender.sendText(chatId, aboutChatText);
  }
  private handleTestTask(message: MessageType) {
    const chatId = message.chat.id;
    this.sender.sendText(chatId, testTaskText);
  }

  private handleRules(message: MessageType) {
    const chatId = message.chat.id;
    this.sender.sendText(chatId, rulesText);
  }
  async getTeamInfo(chatId: number) {
    const team = await this.UserDb.getTeamFromDb(chatId);
    const teamName = team?.name;
    const teamMembers = await this.UserDb.getTeamMembers(chatId);

    const teamInfo = teamMembers
      .map((member) => {
        const userData = member.userData as Prisma.JsonObject;
        if (userData && typeof userData === "object") {
          const { name, surname, contact } = userData;
          return `- ${name} ${surname} <a href="tel:${contact}">${contact}</a>`;
        }
        return "Unknown Member";
      })
      .join("\n");

    const sendTeamInfo = async () => {
      await this.sendLocalStageKeyboard(
        chatId,
        `Ім'я команди: <b>${teamName}</b>\nЧлени команди: <b>\n${teamInfo}</b>\n`,
      );
      await this.sender.sendText(chatId, "Id команди: \n");
      await this.sender.sendText(chatId, team!.id);
    };

    await sendTeamInfo();
  }

  private async handleTeam(message: MessageType) {
    const chatId = message.chat.id;
    const teamMember = await this.UserDb.getTeamMember(chatId);
    if (teamMember?.teamId === null) {
      await this.sceneNavigator.setScene(chatId, SceneEnum.TeamHandle);
      console.log("enter team handle");
      await this.sendLocalStageKeyboard(
        chatId,
        "У вас немає команди, але ви можете це виправити =)",
      );
    } else {
      console.log("enter team info");
      await this.sceneNavigator.setScene(chatId, SceneEnum.TeamInfo);
      await this.getTeamInfo(chatId);
    }
  }
}
