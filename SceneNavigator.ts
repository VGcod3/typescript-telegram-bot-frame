import { UserSession } from ".";
import { allScenes, SceneEnum } from "./scenesList";
import { SessionManager } from "./SessionManager";

export interface iScene {
  name: SceneEnum;
  nextScenes: SceneEnum[] | null;
  prevScene: SceneEnum | null;
}

export class SceneNavigator {
  private readonly scenes: Map<string, iScene>;

  constructor(
    private readonly sessions: Map<number, UserSession>,
    private readonly sessionManager: SessionManager
  ) {
    this.scenes = new Map(allScenes.map((scene) => [scene.name, scene]));

    this.sessionManager = sessionManager;
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

    if (currentScene.prevScene) {
      const sessionData = {
        ...session,
        currentScene: currentScene.prevScene,
      };
      this.sessions.set(chatId, sessionData);
      this.sessionManager.pushSessionData(chatId, sessionData);
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
}
