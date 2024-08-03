import { UserSession } from ".";
import { SessionManager } from "./SessionManager";

export type SessionStorageType = Map<number, UserSession>;

export class UserSessionStorage {
  private static instance: SessionStorageType;

  public static getInstance(): SessionStorageType {
    if (!UserSessionStorage.instance) {
      UserSessionStorage.instance = new Map<number, UserSession>();

      new SessionManager(UserSessionStorage.instance).loadSessionsFromDb();
    }

    return UserSessionStorage.instance;
  }
}
