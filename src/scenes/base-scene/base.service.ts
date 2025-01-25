import { UserDb } from "../../db/user.utils";
import { SceneEnum } from "../../enums/SceneEnum";
import { SceneNavigator } from "../../modules/SceneNavigator";
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
    const enteredText = message.text;

    const chatId = message.chat.id;

    // console.log(message.from?.id);

    this.sender.sendText(chatId, enteredText);

    const availableSceneNames =
      await this.sceneNavigator.getAvailableNextScenes(chatId);

    if (message.text === "Back") {
      this.sceneNavigator.goBack(chatId);
    } else if (availableSceneNames.includes(message.text as SceneEnum)) {
      this.sceneNavigator.setScene(chatId, message.text as SceneEnum);
    } else {
      await this.sender.sendText(chatId, "Invalid option");
    }

    await this.sendLocalStageKeyboard(chatId);
  }

  public async sendLocalStageKeyboard(chatId: number) {
    await this.sceneNavigator.sendStagenavigationKeyboard(
      chatId,
      this.sender,
      "Choose a scene",
    );
  }
}
