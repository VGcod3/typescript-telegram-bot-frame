import { SessionManager, UserSession } from "./SessionManager";
import { UserDb } from "../db/user.db";

export type SessionStorageType = Map<number, UserSession>;

export class UserSessionStorage {
  private static instance: SessionStorageType;

  public static getInstance(userDb: UserDb): SessionStorageType {
    if (!UserSessionStorage.instance) {
      UserSessionStorage.instance = new Map<number, UserSession>();

      new SessionManager(userDb).loadSessionsFromDb();
    }

    return UserSessionStorage.instance;
  }
}
