import { MessageType, Sender } from "../../sender";
import { UserDb } from "../../../db.utils/user.utils";
import { SceneNavigator } from "../../../../SceneNavigator";
import { SessionManager } from "../../../../SessionManager";
import { aprooveMessage, BACK, notAprooveMessage } from "../../../sharedText";
import { SceneEnum } from "../../../../scenesList";
import { prisma } from "../../../db.utils/prisma.client";

export class HandleTeamAdminService {
  private readonly UserDb: UserDb;
  private readonly sender: Sender;
  private readonly sceneNavigator: SceneNavigator;
  private readonly sessionManager: SessionManager;
  team = new Map<number, any>();
  constructor() {
    this.UserDb = new UserDb();
    this.sender = new Sender();

    this.sessionManager = new SessionManager(this.UserDb);
    this.sceneNavigator = new SceneNavigator(this.sessionManager);
  }

  async handleKeyboard(message: MessageType) {
    const chatId = message.chat.id;
    const teamMember = await this.UserDb.getTeamMember(chatId);
    const availableScenes = await this.sceneNavigator.getAvailableNextScenes(
      chatId,
      teamMember,
    );
    const enteredText = message.text;
    if (message.text === "/start") {
      await this.sceneNavigator.setScene(chatId, SceneEnum.Home);
      await this.sendLocalStageKeyboard(chatId, "Оберіть дію");
      return;
    }
    if (enteredText === BACK) {
      this.sceneNavigator.goBack(chatId);
      await this.sendLocalStageKeyboard(chatId, "Оберіть дію");

      return;
    }

    if (enteredText === "Апрув") {
      const team = this.team.get(chatId);
      await prisma.team.update({
        where: {
          id: team.id,
        },
        data: {
          isAprooved: true,
        },
      });
      const members = await prisma.teamMember.findMany({
        where: {
          teamId: team.id,
        },
      });
      members.map(async (member) => {
        await this.sender.sendText(member.chatId, aprooveMessage);
      });
      return;
    } else if (enteredText === "Не апрув") {
      const team = this.team.get(chatId);
      await prisma.team.update({
        where: {
          id: team.id,
        },
        data: {
          isAprooved: false,
        },
      });
      const members = await prisma.teamMember.findMany({
        where: {
          teamId: team.id,
        },
      });
      members.map(async (member) => {
        await this.sender.sendText(member.chatId, notAprooveMessage);
      });
      return;
    }

    const parseTeam = await this.UserDb.getTeamById(enteredText);
    if (parseTeam === null) {
      await this.sendLocalStageKeyboard(chatId, "Нема команди");
      return;
    }
    this.team.set(chatId, parseTeam);
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
    await this.sender.sendKeyboardHTML(chatId, text, keyboardButtons);
  }
}
