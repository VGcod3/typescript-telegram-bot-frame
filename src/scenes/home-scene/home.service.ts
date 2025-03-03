import { MessageType } from "../../modules/Sender";

import { BaseService } from "../base-scene/base.service";

export class HomeService extends BaseService {
  constructor() {
    super();
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
