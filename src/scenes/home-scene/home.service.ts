import { MessageType } from "../../modules/Sender";

import { BaseService } from "../base-scene/base.service";

export class HomeService extends BaseService {
  constructor() {
    super();
  }

  async handleStart(message: MessageType) {
    const chatId = message.chat.id;

    const sessionData = this.sessionManager.initSession(chatId);

    const user = await this.userDb.getUser(chatId);

    if (user) {
      await this.sender.sendText(chatId, "Welcome back!");
    } else {
      await this.userDb.createUser(chatId);
      await this.sender.sendText(chatId, "Welcome, nice to see you!");
    }

    this.initService(chatId, sessionData);
  }

  async handleUsers(message: MessageType) {
    const chatId = message.chat.id;

    try {
      const users = await this.userDb.getAllUsers();

      await this.sender.sendText(chatId, `Users: ${users.length}`);
    } catch (error) {
      await this.sender.sendText(chatId, `Error: ${error}`);
    }
  }
}
