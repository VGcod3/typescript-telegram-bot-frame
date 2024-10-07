import { MessageType, Sender } from "../../sender";
import { UserDb } from "../../../db.utils/user.utils";
import { SceneNavigator } from "../../../../SceneNavigator";
import { SessionManager } from "../../../../SessionManager";
import { BACK } from "../../../sharedText";
import { SceneEnum } from "../../../../scenesList";

export class AdminService {
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
      return;
    }

    if (!availableScenes.includes(enteredText as SceneEnum)) {
      this.sender.sendText(chatId, "Такого варіанту не існує");
      return;
    } else {
      await this.sceneNavigator.setScene(chatId, enteredText as SceneEnum);
    }

    await this.sendLocalStageKeyboard(chatId, "Всім\nЗареєстрованим\nЗ командою\nУчасникам\n\nТекст html\nТекст markdown\nТекст html + фото\nТекст markdown + фото");
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
