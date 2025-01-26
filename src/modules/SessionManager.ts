import { SceneEnum } from "../enums/SceneEnum";
import { SessionStorageType, UserSessionStorage } from "./SessionsStorage";
import { UserDb } from "../db/user.utils";

export interface UserSession {
  currentScene: SceneEnum;
  data: any;
}

export class SessionManager {
  public readonly sessions: SessionStorageType;

  constructor(private readonly userDb: UserDb) {
    this.userDb = userDb;
    this.sessions = UserSessionStorage.getInstance(this.userDb);
  }

  public async pushSessionData(chatId: number, data: any) {
    const user = await this.userDb.getUser(chatId);

    if (!user) {
      return await this.userDb.createUser(chatId);
    }

    this.userDb.updateUser(chatId, data);
  }

  public async loadSessionsFromDb() {
    const users = await this.userDb.getAllUsers();

    users.forEach((user) => {
      this.sessions.set(user.userId, {
        currentScene: user.currentScene as SceneEnum,
        data: user.data,
      });
    });
  }

  public initSession(chatId: number) {
    const sessionData = {
      currentScene: SceneEnum.Home,
      data: {},
    };

    this.sessions.set(chatId, sessionData);

    return sessionData;
  }

  public getSession(chatId: number) {
    return this.sessions.get(chatId);
  }

  public updateSession(chatId: number, data: any) {
    const session = this.sessions.get(chatId);

    if (!session) {
      return;
    }

    const updatedSession = {
      ...session,
      data,
    };

    this.sessions.set(chatId, updatedSession);

    return updatedSession;
  }

  public updateSessionData(chatId: number, data: any) {
    const session = this.sessions.get(chatId);

    if (!session) {
      return;
    }

    const updatedData = {
      ...session.data,
      ...data,
    };

    this.sessions.set(chatId, {
      ...session,
      data: updatedData,
    });

    return updatedData;
  }
}
