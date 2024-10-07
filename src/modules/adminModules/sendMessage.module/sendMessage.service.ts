import { MessageType, Sender } from "../../sender";
import { UserDb } from "../../../db.utils/user.utils";
import { SceneNavigator } from "../../../../SceneNavigator";
import { SessionManager } from "../../../../SessionManager";
import { BACK } from "../../../sharedText";
import { SceneEnum } from "../../../../scenesList";
import { prisma } from "../../../db.utils/prisma.client";
import { Message } from "typescript-telegram-bot-api/dist/types";

export class SendMessageService {
  private readonly UserDb: UserDb;
  private readonly sender: Sender;
  private readonly sceneNavigator: SceneNavigator;
  private readonly sessionManager: SessionManager;
  IDs = new Map<number, number[]>();
  messageType = new Map<number, string>();
  constructor() {
    this.UserDb = new UserDb();
    this.sender = new Sender();

    this.sessionManager = new SessionManager(this.UserDb);
    this.sceneNavigator = new SceneNavigator(this.sessionManager);
  }

  async handleKeyboard(message: Message) {
    const chatId = message.chat.id;
    const enteredText = message.text;
    const teamIdIncluded = enteredText?.includes("teamId");
    const eneteredTeamId = teamIdIncluded !== undefined && teamIdIncluded === true
    try {
      if (message.text === "/start") {
        await this.sceneNavigator.setScene(chatId, SceneEnum.Home);
        await this.sendLocalStageKeyboard(chatId, "Оберіть дію");
        return;
      }

      if (enteredText === BACK) {
        this.sceneNavigator.goBack(chatId);
        await this.sendLocalStageKeyboard(chatId, "Оберіть дію");
      }

      if (
        enteredText === "Всім" ||
        enteredText === "Всім Зареєстрованим" ||
        enteredText === "Всім З командою" ||
        enteredText === "Всім Партікам" ||
        eneteredTeamId
      ) {
        const id = await this.getIdFromTypeOfUsers(enteredText!);
        this.IDs.set(chatId, id);
        return;
      } else if (
        enteredText === "Текст html" ||
        enteredText === "Текст markdown" ||
        enteredText === "Текст html + фото" ||
        enteredText === "Текст markdown + фото"
      ) {
        this.messageType.set(chatId, enteredText);
        await this.askForContent(chatId, enteredText);
      } else {
        this.handleContentSubmission(message);
      }
    } catch (error) {
      console.error(`Error handling keyboard input for chat ${chatId}:`, error);
      await this.sender.sendText(
        chatId,
        "An error occurred while processing your request. Please try again.",
      );
    }
  }

  private async askForContent(chatId: number, messageType: string) {
    try {
      switch (messageType) {
        case "Текст html":
        case "Текст markdown":
          await this.sender.sendText(
            chatId,
            "Please send the message you want to broadcast.",
          );
          break;
        case "Текст html + фото":
        case "Текст markdown + фото":
          await this.sender.sendText(
            chatId,
            "Please send the photo with an optional caption.",
          );
          break;
        default:
          await this.sender.sendText(
            chatId,
            "Please provide the appropriate content.",
          );
      }
    } catch (error) {
      console.error(
        `Error sending message content request to chat ${chatId}:`,
        error,
      );
      await this.sender.sendText(
        chatId,
        "An error occurred while requesting content. Please try again.",
      );
    }
  }

  async handleContentSubmission(message: Message) {
    const chatId = message.chat.id;
    const messageType = this.messageType.get(chatId); // Retrieve the stored message type
    const recipients = this.IDs.get(chatId); // Retrieve the IDs of recipients
  
    if (!messageType || !recipients) return; // Ensure both messageType and recipients exist
  
    try {
      if (message.photo) {
        // Handle photo submissions
        const photo = message.photo[message.photo.length - 1].file_id; // Get the highest resolution photo
        const caption = message.caption || ""; // If there is a caption
        await this.sendTypedMessageWithPhoto(
          messageType,
          recipients,
          photo,
          caption,
          chatId
        );
      } else if (message.text) {
        // Handle text submissions
        await this.sendTypedMessage(
          messageType,
          recipients,
          message.text,
          chatId
        );
      }
    } catch (error) {
      console.error(`Error handling content submission for chat ${chatId}:`, error);
      await this.sender.sendText(chatId, "An error occurred while processing your submission. Please try again.");
    }
  }
  

  private async getIdFromTypeOfUsers(enteredText: string) {
    const teamIdPattern = /teamId:\d+/;
    const match = enteredText!.match(teamIdPattern);

    try {
      if (enteredText === "Всім") {
        const members = await prisma.user.findMany({
          select: {
            userId: true,
          },
        });
        return members.map((a) => a.userId);
      } else if (enteredText === "Всім Зареєстрованим") {
        const members = await prisma.teamMember.findMany({
          select: {
            chatId: true,
          },
        });
        return members.map((a) => a.chatId);
      } else if (enteredText === "Всім З командою") {
        const members = await prisma.teamMember.findMany({
          where: {
            teamId: {
              not: null,
            },
          },
          select: {
            chatId: true,
          },
        });
        return members.map((a) => a.chatId);
      } else if (enteredText === "Всім Партікам") {
        const teams = await prisma.team.findMany({
          where: {
            isAprooved: true,
          },
        });

        const allApprovedMembers: number[] = [];

        for (const team of teams) {
          const approvedMembers = await prisma.teamMember.findMany({
            where: {
              teamId: team.id,
            },
            select: {
              chatId: true,
            },
          });
          approvedMembers.map((a) => {
            allApprovedMembers.push(a.chatId);
          });
        }

        return allApprovedMembers;
      } else if (match !== null) {
        const teamId = enteredText!.split(":")[1];
        const member = await prisma.teamMember.findUnique({
          where: {
            teamId: teamId,
          },
          select: {
            chatId: true,
          },
        });

        return member ? [member.chatId] : [];
      } else {
        return [];
      }
    } catch (error) {
      console.error(`Error fetching user IDs for ${enteredText}:`, error);
      return [];
    }
  }

  private async sendTypedMessage(
    enteredText: string,
    IDs: number[],
    content: string,
    chatId: number,
  ) {
    try {
      switch (enteredText) {
        case "Текст html":
          IDs.forEach((chatId) => {
            this.sender.sendText(chatId, content);
          });
          break;
        case "Текст markdown":
          IDs.forEach((chatId) => {
            this.sender.sendTextMARKDOWN(chatId, content);
          });
          break;
      }
    } catch (error) {
      console.error("Error sending typed message:", error);
      await this.sender.sendText(
        chatId,
        "An error occurred while sending the message. Please try again.",
      );
    }
  }

  private async sendTypedMessageWithPhoto(
    enteredText: string,
    IDs: number[],
    photoId: string,
    caption: string,
    chatId: number,
  ) {
    try {
      switch (enteredText) {
        case "Текст html + фото":
          IDs.forEach((chatId) => {
            this.sender.sendPhotoHTML(chatId, caption, undefined, photoId);
          });
          break;
        case "Текст markdown + фото":
          IDs.forEach((chatId) => {
            this.sender.sendPhotoMarkdown(chatId, photoId, caption);
          });
          break;
      }
    } catch (error) {
      console.error("Error sending message with photo:", error);
      await this.sender.sendText(
        chatId,
        "An error occurred while sending the photo message. Please try again.",
      );
    }
  }

  private chunkArray<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }
  private async sendLocalStageKeyboard(chatId: number, text: string) {
    const currentScene = await this.sceneNavigator.getCurrentScene(chatId);
    const teamMember = await this.UserDb.getTeamMember(chatId);

    const availableScenesNames =
      await this.sceneNavigator.getAvailableNextScenes(chatId, teamMember);

    const scenesButtons = availableScenesNames.map((scene) => ({
      text: scene,
    }));

    const canGoBack = !!currentScene.prevScene;
    const allButtons = canGoBack
      ? [...scenesButtons, { text: BACK }]
      : scenesButtons;

    const keyboardButtons = this.chunkArray(allButtons, 2);
    await this.sender.sendKeyboardHTML(chatId, text, keyboardButtons);
  }
}
