import { MessageType } from "./Sender";
import { SceneNavigator } from "./SceneNavigator";
import { SceneEnum } from "../enums/SceneEnum";

interface MessageHandler {
  handle(message: MessageType): Promise<void>;
}

class BackMessageHandler implements MessageHandler {
  constructor(private sceneNavigator: SceneNavigator) {}

  async handle(message: MessageType): Promise<void> {
    const chatId = message.chat.id;
    await this.sceneNavigator.goBack(chatId);
  }
}

class SceneMessageHandler implements MessageHandler {
  constructor(private sceneNavigator: SceneNavigator) {}

  async handle(message: MessageType): Promise<void> {
    const chatId = message.chat.id;
    const availableSceneNames =
      await this.sceneNavigator.getAvailableNextScenes(chatId);

    if (availableSceneNames.includes(message.text as SceneEnum)) {
      await this.sceneNavigator.setScene(chatId, message.text as SceneEnum);
    } else {
      throw new Error("Invalid scene");
    }
  }
}

export { BackMessageHandler, SceneMessageHandler };
