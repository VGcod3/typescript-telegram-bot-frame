import { TelegramBot } from "typescript-telegram-bot-api";
import { MessageType, Sender } from "../sender";
import { TeamService } from "./teamMember.service";
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
    if (message.text === "Про бест") {
      this.teamService.handleAboutBest(message);
    }
    else if (message.text === "Про івент") {
      this.teamService.handleAboutCTF(message);
    }
    else if (message.text === "Місце проведення") {
      this.teamService.handleLocation(message);
    }
    else if (message.text === "Чат") {
      this.teamService.handleChat(message);
    }
    else if (message.text === "Тестове завдання") {
      this.teamService.handleTestTask(message);
    }
    else if (message.text === "Правила івенту") {
      this.teamService.handleRules(message);
    }
    else if (message.text === "Інформація про команду") {
      this.teamService.handleTeam(message);
    }
  }
}
