import { UserDb } from "../../db/user.utils";
import { SceneEnum } from "../../enums/SceneEnum";
import { BACK_BUTTON, SceneNavigator } from "../../modules/SceneNavigator";
import { MessageType, Sender } from "../../modules/Sender";
import { SessionManager } from "../../modules/SessionManager";

export abstract class BaseService {
  protected userDb: UserDb;
  protected sender: Sender;
  protected sessionManager: SessionManager;
  protected sceneNavigator: SceneNavigator;

  constructor() {
    this.userDb = new UserDb();
    this.sender = new Sender();
    this.sessionManager = new SessionManager(this.userDb);

    this.sceneNavigator = new SceneNavigator(this.sessionManager);
  }

  async initService(chatId: number, sessionData: any) {
    await this.sendLocalStageKeyboard(chatId);

    await this.sessionManager.pushSessionData(chatId, sessionData);
  }

  async handleKeyboard(message: MessageType): Promise<void> {
    const chatId = message.chat.id;

    const availableSceneNames =
      await this.sceneNavigator.getAvailableNextScenes(chatId);

    if (message.text === BACK_BUTTON) {
      this.sceneNavigator.goBack(chatId);
    } else if (availableSceneNames.includes(message.text as SceneEnum)) {
      this.sceneNavigator.setScene(chatId, message.text as SceneEnum);
    } else {
      await this.sender.sendText(chatId, "Invalid option");
    }

    await this.sendLocalStageKeyboard(chatId);
  }

  public async sendLocalStageKeyboard(chatId: number) {
    await this.sceneNavigator.sendStagenavigationKeyboard(chatId, this.sender);
  }
}
