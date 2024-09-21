import { set, ZodAny, ZodString } from "zod";
import { BotInstance } from "../../../BotInstance";
import { SceneNavigator } from "../../../SceneNavigator";
import { SceneEnum } from "../../../scenesList";
import { SessionManager } from "../../../SessionManager";
import { UserDb } from "../../db.utils/user.utils";
import {
  age,
  surname,
  university,
  group,
  course,
  source,
  contact,
  name,
} from "../../z.schemas/schema.TeamMember";
import { MessageType, Sender } from "../sender";
import { BACK, startMessage } from "../../sharedText";
import { ITeamMemberData } from "../../interfaces/teamMemberData";

export enum RegistrationSteps {
  ASK_NAME = "ask_name",
  ASK_AGE = "ask_age",
  ASK_SURNAME = "ask_surname",
  ASK_UNIVERSITY = "ask_university",
  ASK_GROUP = "ask_group",
  ASK_COURSE = "ask_course",
  ASK_SOURCE = "ask_source",
  ASK_CONTACT = "ask_contact",
  FINISHED = "finished",
}

export class RegistrationService {
  constructor(
    private readonly UserDb: UserDb,
    private readonly sender: Sender,
    private readonly sceneNavigator: SceneNavigator,
    private readonly sessionManager: SessionManager,
  ) {
    this.UserDb = UserDb;
    this.sender = sender;
    this.sessionManager = sessionManager;
    this.sceneNavigator = sceneNavigator;
  }

  private bot = BotInstance.getInstance();
  public temporaryData = new Map<number, ITeamMemberData>() as any;

  async handleKeyboard(message: MessageType) {
    const chatId = message.chat.id;
    const availableSceneNames =
      await this.sceneNavigator.getAvailableNextScenes(chatId, null);

    if (message.text === BACK) {
      this.sceneNavigator.goBack(chatId);
      this.sessionManager.updateRegistrationStep(
        chatId,
        RegistrationSteps.ASK_NAME,
      );
    } else if (availableSceneNames.includes(message.text as SceneEnum)) {
      this.sceneNavigator.setScene(chatId, message.text as SceneEnum);
    } else {
      await this.sender.sendText(chatId, "Такого варіанту не існує");
    }

    await this.sendLocalStageKeyboard(chatId, startMessage);
  }

  async setUserStep(chatId: number, step: RegistrationSteps) {
    console.log("Setting step: " + step);
    this.sessionManager.updateRegistrationStep(chatId, step);
  }
  async handleUserInput(
    schema: any,
    chatId: number,
    nextStep: RegistrationSteps,
    fieldName: keyof ITeamMemberData, // Dynamically pass the field name
    isNumber = false,
  ) {
    // Clear any previous listeners for the same chat ID
    this.bot.removeAllListeners("message");

    this.bot.once("message", async (message: MessageType) => {
      if (message.chat.id !== chatId) return;

      const { text, contact } = message;

      if (text === BACK) {
        return;
      }

      // Handle number input validation
      if (isNumber && text) {
        const number = Number(text);
        const validationResult = schema.safeParse(number);
        if (!validationResult.success) {
          await this.sender.sendText(
            chatId,
            validationResult.error.errors[0]?.message,
          );
          return;
        }

        this.updateTeamMemberField(chatId, fieldName, number);
        await this.setUserStep(chatId, nextStep);
        return;
      }

      // Handle contact input
      if (fieldName === "contact") {
        this.sessionManager.updateRegistrationStep(
          chatId,
          RegistrationSteps.FINISHED,
        );
        if (contact) {
          this.updateTeamMemberField(chatId, fieldName, contact.phone_number);
        } else if (text === "Поділитися нікнеймом") {
          
          this.updateTeamMemberField(chatId, fieldName, message.chat.username);
        }

        const teamMemberData = { ...this.temporaryData.get(chatId) };
        await this.UserDb.createTeamMember(chatId, teamMemberData);

        await this.handleFinishStep(chatId);
        await this.sender.sendText(chatId, "Дякуємо за реєстрацію");
        await this.sendLocalStageKeyboard(chatId, startMessage);
        return;
      }

      // Handle text input validation
      if (text) {
        const validationResult = schema.safeParse(text);
        if (!validationResult.success) {
          await this.sender.sendText(
            chatId,
            validationResult.error.errors[0]?.message,
          );
          return;
        }

        this.updateTeamMemberField(chatId, fieldName, text);
        await this.setUserStep(chatId, nextStep);
      }
    });
  }

  updateTeamMemberField = <K extends keyof ITeamMemberData>(
    chatId: number,
    field: K,
    value: any,
  ) => {
    const member = this.temporaryData.get(chatId);

    if (member) {
      member[field] = value;

      this.temporaryData.set(chatId, member);
    }
  };

  async getUserStep(chatId: number): Promise<RegistrationSteps> {
    const userSession = await this.sessionManager.getSession(chatId);
    if (!userSession.data.registrationStep) {
      await this.setUserStep(chatId, RegistrationSteps.ASK_NAME);
    }
    return userSession.data.registrationStep;
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
    console.log(teamMember);
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

    await this.sender.sendKeyboard(chatId, text, keyboardButtons);
  }

  private async handleFinishStep(chatId: number) {
    
    this.temporaryData.delete(chatId);
    await this.sceneNavigator.setScene(chatId, SceneEnum.Home);
  }

  async collectData(message: MessageType) {
    const chatId = message.chat.id;
    const teamMember = await this.UserDb.getTeamMember(chatId);

    const currentStep = await this.getUserStep(chatId);
    if (teamMember !== null) {
      await this.sender.sendText(chatId, "Ви вже зареєстровані");
      return;
    } else {
      if (!this.temporaryData.has(chatId)) {
        this.temporaryData.set(chatId, []);
      }

      switch (currentStep) {
        case RegistrationSteps.ASK_NAME:
          await this.sender.sendKeyboard(chatId, "Введіть ваше ім'я", [
            [{ text: BACK }],
          ]);
          await this.handleUserInput(
            name,
            chatId,
            RegistrationSteps.ASK_SURNAME,
            "name",
          );
          break;

        case RegistrationSteps.ASK_SURNAME:
          await this.sender.sendKeyboard(chatId, "Введіть ваше прізвище", [
            [{ text: BACK }],
          ]);
          await this.handleUserInput(
            surname,
            chatId,
            RegistrationSteps.ASK_AGE,
            "surname",
          );
          break;

        case RegistrationSteps.ASK_AGE:
          await this.sender.sendKeyboard(chatId, "Введіть ваш вік", [
            [{ text: BACK }],
          ]);
          await this.handleUserInput(
            age,
            chatId,
            RegistrationSteps.ASK_UNIVERSITY,
            "age",
            true,
          );
          break;

        case RegistrationSteps.ASK_UNIVERSITY:
          await this.sender.sendKeyboard(
            chatId,
            "Введіть ваш університет",
            [
              [{ text: "НУЛП" }, { text: "ЛНУ" }, { text: "НЛУУ" }],
              [{ text: BACK }],
            ],
            true,
          );
          await this.handleUserInput(
            university,
            chatId,
            RegistrationSteps.ASK_GROUP,
            "university",
          );
          break;

        case RegistrationSteps.ASK_GROUP:
          await this.sender.sendText(chatId, "Введіть вашу групу");
          await this.handleUserInput(
            group,
            chatId,
            RegistrationSteps.ASK_COURSE,
            "group",
          );
          break;

        case RegistrationSteps.ASK_COURSE:
          await this.sender.sendKeyboard(
            chatId,
            "Введіть ваш курс",
            [
              [{ text: "1" }, { text: "2" }, { text: "3" }],
              [{ text: "4" }, { text: "5" }, { text: "6" }],
              [{ text: BACK }],
            ],
            true,
          );
          await this.handleUserInput(
            course,
            chatId,
            RegistrationSteps.ASK_SOURCE,
            "course",
            true,
          );
          break;

        case RegistrationSteps.ASK_SOURCE:
          await this.sender.sendKeyboard(chatId, "Як ви дізналися про нас?", [
            [{ text: BACK }],
          ]);
          await this.handleUserInput(
            source,
            chatId,
            RegistrationSteps.ASK_CONTACT,
            "source",
          );
          break;

        case RegistrationSteps.ASK_CONTACT:
          await this.sender.sendKeyboard(
            chatId,
            "Будь ласка, залиште свої контакти:",
            [
              [{ text: "Поділитися номером", request_contact: true }],
              [{ text: "Поділитися нікнеймом" }],

              [{ text: BACK }],
            ],
            true,
          );
          await this.handleUserInput(
            contact,
            chatId,
            RegistrationSteps.FINISHED,
            "contact",
          );
          break;

        case RegistrationSteps.FINISHED:
          await this.handleUserInput(
            ZodAny,
            chatId,
            RegistrationSteps.FINISHED,
            "contact",
          );

          break;
      }
    }
  }
}
