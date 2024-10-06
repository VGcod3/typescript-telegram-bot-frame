import { MessageType, Sender } from "../sender";
import { UserDb } from "../../db.utils/user.utils";
import { SceneNavigator } from "../../../SceneNavigator";
import { SessionManager } from "../../../SessionManager";
import { SceneEnum } from "../../../scenesList";
import { prisma } from "../../db.utils/prisma.client";
import { BACK, startMessage } from "../../sharedText";

export class TeamCreateService {
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

    await this.sender.sendText(chatId, "Ласкаво просимо, студенте!");

    await this.sendLocalStageKeyboard(chatId, startMessage);
  }
  async createTeam(teamName: string, chatId: number) {
    const existTeam = await prisma.team.findMany({
      where: {
        name: teamName,
      },
    });
    if (existTeam.length > 0) {
      await this.sendLocalStageKeyboard(
        chatId,
        "Дана назва вже зайнята. Введіть назву ще раз",
      );
      return;
    } else {
      const newTeam = await prisma.team.create({
        data: {
          name: teamName,
        },
      });
      const user = await prisma.user.findUnique({
        where: {
          userId: chatId,
        },
      });
      await prisma.teamMember.update({
        where: {
          userId: user?.id,
        },
        data: {
          teamId: newTeam.id,
        },
      });

      await this.sceneNavigator.setScene(chatId, SceneEnum.Home);
      await this.sendLocalStageKeyboard(
        chatId,
        `Команда створена\\! Щоб до неї приєдналися інші учасники, поділіться ID вашої команди: \`${this.escapeMarkdown(
          newTeam!.id.toString(),
        )}\``,
        true,
      );
    }
  }
  private escapeMarkdown(text: string | undefined): string {
    return text?.replace(/([_*[\]()~`>#+\-=|{}.!])/g, "\\$1") || "";
  }
  async handleKeyboard(message: MessageType) {
    const chatId = message.chat.id;
    const enteredText = message.text;

    if (enteredText === BACK) {
      await this.sceneNavigator.goBack(chatId);
      await this.sendLocalStageKeyboard(chatId, "Оберіть дію");
    } else {
      await this.createTeam(enteredText, chatId);
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
}
