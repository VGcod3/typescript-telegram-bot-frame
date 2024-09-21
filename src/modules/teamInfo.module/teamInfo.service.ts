import { MessageType, Sender } from "../sender";
import { UserDb } from "../../db.utils/user.utils";
import { SceneNavigator } from "../../../SceneNavigator";
import { SessionManager } from "../../../SessionManager";
import { SceneEnum } from "../../../scenesList";
import { prisma } from "../../db.utils/prisma.client";

export class TeamInfoService {
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

  async handleKeyboard(message: MessageType) {
    const chatId = message.chat.id;
    const enteredText = message.text;

    if (enteredText === BACK) {
      this.sceneNavigator.goBack(chatId);
    } else if (message.text === "Вийти з команди") {
      await this.exitFromTeam(chatId);
      await this.sender.sendText(chatId, "Ви вийшли з команди!");
      await this.sceneNavigator.setScene(chatId, SceneEnum.Home);
    } else {
      await this.sender.sendText(chatId, "Такого варіанту не існує");
    }

    await this.sendLocalStageKeyboard(chatId, "Оберіть дію");
  }

  async exitFromTeam(chatId: number) {
    const user = await prisma.user.findUnique({
      where: {
        userId: chatId,
      },
    });
    const teamMember = await prisma.teamMember.findUnique({
      where: {
        userId: user?.id,
      },
    });

    if (teamMember?.teamId !== null) {
      await prisma.teamMember.update({
        where: {
          userId: user?.id,
        },
        data: {
          teamId: null,
        },
      });
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
}
