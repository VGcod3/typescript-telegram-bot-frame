import { SceneFactory } from "./SceneFactory";

import { SceneEnum } from "../enums/SceneEnum";
import { Sender } from "./Sender";
import { UserSession, SessionManager } from "./SessionManager";
import { SceneRoute, scenesMap } from "./SceneRouting";

export const BACK_BUTTON = "⬅️  Back";

export class SceneNavigator {
  private readonly scenes: Map<SceneEnum, SceneRoute>;
  private readonly sessions: Map<number, UserSession>;
  private readonly sceneFactory: typeof SceneFactory;

  constructor(private readonly sessionManager: SessionManager) {
    this.sessionManager = sessionManager;
    this.sessions = sessionManager.sessions;

    this.sceneFactory = SceneFactory;

    this.scenes = scenesMap;
  }

  public async setScene(chatId: number, sceneName: SceneEnum): Promise<void> {
    const session = this.sessions.get(chatId);

    if (!session) {
      this.sessionManager.initSession(chatId);

      this.setScene(chatId, sceneName);
      return;
    }

    this.sceneFactory.buildScene(sceneName).enter();

    const sessionData = {
      data: session.data || {},
      currentScene: sceneName,
    };

    this.sessions.set(chatId, sessionData);
    this.sessionManager.pushSessionData(chatId, sessionData);
  }

  public async goBack(chatId: number): Promise<void> {
    const session = this.sessions.get(chatId);

    if (!session) {
      this.sessionManager.initSession(chatId);

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
      this.sessionManager.initSession(chatId);
      return this.getAvailableNextScenes(chatId);
    }

    const currentScene = await this.getCurrentScene(chatId);

    const nextScenes = currentScene.nextScenes;

    if (nextScenes === null) {
      return [];
    }

    return nextScenes;
  }

  private getScene(sceneName: SceneEnum): SceneRoute {
    const scene = this.scenes.get(sceneName);

    return scene ? scene : this.scenes.get(SceneEnum.Home)!;
  }

  public async getCurrentScene(chatId: number): Promise<SceneRoute> {
    const session = this.sessions.get(chatId);

    if (!session) {
      this.sessionManager.initSession(chatId);
      return this.getCurrentScene(chatId);
    }

    return this.getScene(session.currentScene);
  }

  public async sendStagenavigationKeyboard(
    chatId: number,
    sender: Sender,
    textMessage: string = "⌨️",
  ) {
    const currentScene = await this.getCurrentScene(chatId);

    const availableScenesNames = await this.getAvailableNextScenes(chatId);

    const canGoBack = !!currentScene.prevScene;

    await sender.sendKeyboard(chatId, textMessage, [
      availableScenesNames.map((scene) => ({ text: scene })),

      canGoBack ? [{ text: BACK_BUTTON }] : [],
    ]);
  }
}
