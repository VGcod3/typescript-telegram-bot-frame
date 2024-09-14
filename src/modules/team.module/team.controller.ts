import { TelegramBot } from "typescript-telegram-bot-api";
import { MessageType, Sender } from "../sender";
import { TeamService } from "./team.service";
import { BotInstance } from "../../../BotInstance";

export class TeamController {
  private readonly bot: TelegramBot;

  constructor(private readonly teamService: TeamService) {
    this.teamService = teamService;

    this.bot = BotInstance.getInstance();

    this.bot.on("message:text", async (message) => {
      await this.handleTextMessage(message);
    }
    );
  }

  public async handleTextMessage(message: MessageType) {
    if (message.text !== "Назад" ) {
    
    }
    else {
      this.teamService.handleKeyboard(message);
    }
  }
}
