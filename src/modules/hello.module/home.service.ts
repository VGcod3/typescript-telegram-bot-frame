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
    await this.sceneNavigator.setScene(chatId, SceneEnum.Home);
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
    const teamAprooved = (await this.UserDb.getTeamFromDb(chatId))?.isAprooved;
    const availableScenes = await this.sceneNavigator.getAvailableNextScenes(
      chatId,
      teamMember,
      teamAprooved,
    );
    const enteredText = message.text;

    if (enteredText === BACK) {
      this.sceneNavigator.goBack(chatId);
      return;
    }

    if (!availableScenes.includes(enteredText as SceneEnum)) {
      this.sender.sendText(chatId, "Такого варіанту не існує");
      return;
    }

    if (teamMember === null) {
      this.handleNewUserScenes(enteredText, chatId);
    } else if (teamAprooved) {
      this.handleTeamAproovedScenes(enteredText, message);
    } else if (teamMember) {
      this.handleTeamMemberScenes(enteredText, message);
    }
  }

  private async handleNewUserScenes(text: string, chatId: number) {
    switch (text) {
      case "Про BEST":
        this.handleAboutBest(chatId);
        break;
      case "Про івент":
        this.handleAboutCTF(chatId);
        break;
      case "Реєстрація":
        await this.sceneNavigator.setScene(chatId, SceneEnum.Registration);
        await this.sendLocalStageKeyboard(
          chatId,
          "Введіть Ваше ім'я та прізвище",
        );
    }
  }
  private async handleTeamMemberScenes(text: string, message: MessageType) {
    const chatId = message.chat.id;
    switch (text) {
      case "Про BEST":
        this.handleAboutBest(chatId);
        break;
      case "Тестове завдання":
        this.handleTestTask(chatId);
        break;
      case "Чат для пошуку команди":
        this.handleChat(chatId);
        break;
      case "Про івент":
        this.handleAboutCTF(chatId);
        break;
      case "Інформація про команду":
        this.handleTeam(message);
        break;
      default:
        break;
    }
  }
  private async handleTeamAproovedScenes(text: string, message: MessageType) {
    const chatId = message.chat.id;
    switch (text) {
      case "Місце проведення":
        this.handleLocation(chatId);
        break;
      case "Правила івенту":
        this.handleRules(chatId);
        break;
      case "Чат для учасників":
        this.handleChat(chatId);
        break;
      case "Інформація про команду":
        this.handleTeam(message);
        break;
      case "Тестове завдання":
        this.handleTestTask(chatId);
      default:
        break;
    }
  }
  private async handleTeam(message: MessageType) {
    const chatId = message.chat.id;
    const teamMember = await this.UserDb.getTeamMember(chatId);

    if (teamMember?.teamId === null) {
      await this.sceneNavigator.setScene(chatId, SceneEnum.TeamHandle);
      await this.sendLocalStageKeyboard(
        chatId,
        `У вас немає команди, але ви можете це виправити =)\nЯкщо наразі Ви не маєте напарників, то ласкаво просимо до <a href="google.com">нашого чату!</a>`,
      );
    } else {
      await this.sceneNavigator.setScene(chatId, SceneEnum.TeamInfo);
      this.getTeamInfo(chatId);
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
  private async sendLocalStageKeyboard(
    chatId: number,
    text: string,
    MarkdownV2: boolean = false,
  ) {
    const currentScene = await this.sceneNavigator.getCurrentScene(chatId);
    const teamMember = await this.UserDb.getTeamMember(chatId);
    const isAprooved = (await this.UserDb.getTeamFromDb(chatId))?.isAprooved;
    const availableScenesNames =
      await this.sceneNavigator.getAvailableNextScenes(
        chatId,
        teamMember,
        isAprooved,
      );

    const scenesButtons = availableScenesNames.map((scene) => ({
      text: scene,
    }));

    const canGoBack = !!currentScene.prevScene;
    const allButtons = canGoBack
      ? [...scenesButtons, { text: BACK }]
      : scenesButtons;

    const keyboardButtons = this.chunkArray(allButtons, 2);
    if (!MarkdownV2)
      await this.sender.sendKeyboardHTML(chatId, text, keyboardButtons);
    else {
      await this.sender.sendKeyboardMARKDOWN(chatId, text, keyboardButtons);
    }
  }

  private handleAboutBest(chatId: number) {
    this.sender.sendText(chatId, aboutBestText);
  }
  handleAboutCTF(chatId: number) {
    this.sender.sendText(chatId, aboutEventText);
  }
  private handleLocation(chatId: number) {
    this.sender.sendText(chatId, locationText);
  }
  private handleChat(chatId: number) {
    this.sender.sendText(chatId, aboutChatText);
  }
  private handleTestTask(chatId: number) {
    this.sender.sendText(chatId, testTaskText);
  }

  private handleRules(chatId: number) {
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
          const name =
            typeof userData.name === "string" ? userData.name : "Unknown";
          const contact =
            typeof userData.contact === "string" ? userData.contact : "N/A";
          return `\\- ${this.escapeMarkdown(
            name,
          )} \n  Контакти: ${this.escapeMarkdown(contact)}`;
        }
        return "Unknown Member";
      })
      .join("\n");

    const sendTeamInfo = async () => {
      await this.sender.sendTextMARKDOWN(
        chatId,
        `Id команди: \`${this.escapeMarkdown(
          team!.id.toString(),
        )}\`\n*Ім'я команди:* ${this.escapeMarkdown(
          teamName,
        )}\n*Члени команди:*\n${teamInfo}\n`,
        true,
      );
    };

    await sendTeamInfo();
  }

  private escapeMarkdown(text: string | undefined): string {
    return text?.replace(/([_*[\]()~`>#+\-=|{}.!])/g, "\\$1") || "";
  }
}
