import { BotInstance } from "./BotInstance";
import { AllScenes, iScene, SceneEnum } from "./scenesList";
import { SessionManager, UserSession } from "./SessionManager";
import { Sender } from "./src/modules/sender";

export class SceneNavigator {
  private readonly scenes: Map<string, iScene>;
  private readonly sessions: Map<number, UserSession>;

  constructor(private readonly sessionManager: SessionManager) {
    const allScenes = new AllScenes().allScenes;

    this.sessionManager = sessionManager;
    this.sessions = sessionManager.sessions;

    this.scenes = new Map(allScenes.map((scene) => [scene.name, scene]));
  }

  public async setScene(chatId: number, sceneName: SceneEnum): Promise<void> {
    const session = this.sessions.get(chatId);

    if (!session) {
      await this.sessionManager.initSession(chatId);

      this.setScene(chatId, sceneName);
      return;
    }

    const sessionData = {
      ...session,
      currentScene: sceneName,
    };

    this.sessions.set(chatId, sessionData);
    this.enterModuleScene(chatId);
    this.sessionManager.pushSessionData(chatId, sessionData);
  }

  public async goBack(chatId: number): Promise<void> {
    const session = this.sessions.get(chatId);

    if (!session) {
      await this.sessionManager.initSession(chatId);

      this.goBack(chatId);
      return;
    }

    const currentScene = this.getScene(session.currentScene);

    const prevScene = currentScene.prevScene;

    if (prevScene) {
      this.setScene(chatId, prevScene);
    }
  }

  public async getAvailableNextScenes(chatId: number): Promise<SceneEnum[]> {
    const session = this.sessions.get(chatId);

    if (!session) {
      await this.sessionManager.initSession(chatId);
      return this.getAvailableNextScenes(chatId);
    }

    const currentScene = await this.getCurrentScene(chatId);

    const nextScenes = currentScene.nextScenes;

    if (nextScenes == null) {
      return [];
    }

    return nextScenes;
  }

  private getScene(sceneName: string): iScene {
    const scene = this.scenes.get(sceneName);

    return scene ? scene : this.scenes.get(SceneEnum.Home)!;
  }

  public async getCurrentScene(chatId: number): Promise<iScene> {
    const session = this.sessions.get(chatId);

    if (!session) {
      await this.sessionManager.initSession(chatId);
      return this.getCurrentScene(chatId);
    }

    return this.getScene(session.currentScene);
  }

  private async enterModuleScene(chatId: number) {
    const currentScene = await this.getCurrentScene(chatId);

    const bot = BotInstance.getInstance();

    bot.removeAllListeners();

    currentScene.enter();
  }

  public async sendStagenavigationKeyboard(
    chatId: number,
    sender: Sender,
    textMessage: string = "Choose an option",
  ) {
    const currentScene = await this.getCurrentScene(chatId);

    const availableScenesNames = await this.getAvailableNextScenes(chatId);

    const canGoBack = !!currentScene.prevScene;

    await sender.sendKeyboard(chatId, textMessage, [
      availableScenesNames.map((scene) => ({ text: scene })),

      canGoBack ? [{ text: "Back" }] : [],
    ]);
  }
}
