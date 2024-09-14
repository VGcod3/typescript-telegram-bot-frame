import { TelegramBot } from "typescript-telegram-bot-api";
import { MessageType, Sender } from "../sender";
import { NewTeamService } from "./newTeam.service";
import { BotInstance } from "../../../BotInstance";

export class NewTeamController {
  private readonly bot: TelegramBot;

  constructor(private readonly newTeamService: NewTeamService) {
    this.newTeamService = newTeamService;

    this.bot = BotInstance.getInstance();

    this.bot.on("message:text", async (message) => {
      await this.handleTextMessage(message);
    }
    );
  }

  public async handleTextMessage(message: MessageType) {
    if(message.text === "Приєднатися до команди"){
      this.newTeamService.handleJoinTeam(message);
    }else if (message.text === "Створити команду") {
      this.newTeamService.handleCreateTeam(message);
    }
  }
}
