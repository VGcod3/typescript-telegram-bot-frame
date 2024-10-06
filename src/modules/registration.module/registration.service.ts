import { SceneNavigator } from "../../../SceneNavigator";
import { SceneEnum } from "../../../scenesList";
import { SessionManager } from "../../../SessionManager";
import { UserDb } from "../../db.utils/user.utils";
import {
  age,
  university,
  group,
  source,
  name,
  contact,
  course,
} from "../../z.schemas/schema.TeamMember";
import { MessageType, Sender } from "../sender";
import { BACK, startMessage } from "../../sharedText";
import { Contact, Message } from "typescript-telegram-bot-api/dist/types";

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
  async handleStart(message: MessageType) {
    const chatId = message.chat.id;
    await this.sessionManager.initSession(chatId);
    await this.sceneNavigator.setScene(chatId, SceneEnum.Home);

    await this.sender.sendText(chatId, "Ласкаво просимо, студенте!");

    await this.sendLocalStageKeyboard(chatId, startMessage);
  }
  async handleKeyboard(message: MessageType) {
    const chatId = message.chat.id;
    const enteredText = message.text;
    const availableSceneNames =
      await this.sceneNavigator.getAvailableNextScenes(chatId);

    if (enteredText === BACK) {
      await this.sessionManager.updateRegistrationSteps(chatId, "name");
      this.sceneNavigator.goBack(chatId);
    } else if (availableSceneNames.includes(enteredText as SceneEnum)) {
      await this.sceneNavigator.setScene(chatId, enteredText as SceneEnum);
    } else {
      await this.sender.sendText(chatId, "Такого варіанту не існує");
    }

    await this.sendLocalStageKeyboard(chatId, startMessage);
  }

  async handleRegistration(message: MessageType) {
    const chatId = message.chat.id;
    const enteredText = message.text;
    const session = await this.sessionManager.getSession(chatId);
    if (session.data.registrationStep === undefined)
      await this.sessionManager.updateRegistrationSteps(chatId, "name");

    const step = (await this.sessionManager.getSession(chatId)).data
      .registrationStep;
    console.log("Step by " + message.from?.username + ": " + step);

    if (await this.validateRegistrationStep(step, enteredText, chatId, message))
      await this.handleRegistrationStep(step, chatId, enteredText);
  }

  private async validateRegistrationStep(
    step: string,
    enteredText: any,
    chatId: number,
    message?: MessageType,
  ): Promise<boolean> {
    // Define the schema based on the current step
    let schema;
    console.log(
      "Entered text by " + message?.from?.username + ": " + enteredText,
    );
    switch (step) {
      case "name":
        schema = name;
        break;
      case "age":
        schema = age;
        enteredText = Number(enteredText);
        break;
      case "university":
        schema = university;
        break;
      case "group":
        schema = group;
        break;
      case "course":
        schema = course;
        enteredText = Number(enteredText);
        break;
      case "source":
        schema = source;
        break;
      case "contact":
        schema = contact;

        if (enteredText === "Нікнейм" || enteredText === BACK) {
          await this.saveUserDataFiledToDB(step, chatId, enteredText, message);
          return true;
        } else {
          await this.sender.sendKeyboardHTML(
            chatId,
            "Будь-ласка скористайтеся доступними кнопками для взаємодії",
            [
              [{ text: "Номер телефону" }],
              [{ text: "Нікнейм" }],
              [{ text: BACK }],
            ],
          );
          return false;
        }
    }

    // Validate the entered text using the selected schema
    const parsed = schema!.safeParse(enteredText);

    // If validation fails, return the error message
    if (!parsed.success) {
      if (step === "course") {
        await this.sender.sendKeyboardHTML(
          chatId,
          parsed.error.errors[0].message,
          [
            [{ text: "1" }, { text: "2" }],
            [{ text: "3" }, { text: "4" }],
            [{ text: "5" }, { text: "6" }],
            [{ text: BACK }],
          ],
        );
      } else {
        await this.sendLocalStageKeyboard(
          chatId,
          parsed.error.errors[0].message,
        );
      }

      return false;
    }

    // If validation succeeds, return null (no error)
    await this.saveUserDataFiledToDB(step, chatId, enteredText);
    return true;
  }
  private async saveUserDataFiledToDB(
    step: string,
    chatId: number,
    enteredText: string,
    message?: MessageType,
  ) {
    switch (step) {
      case "name":
        await this.sessionManager.updateUserInfo(chatId, { name: enteredText });
        break;

      case "age":
        await this.sessionManager.updateUserInfo(chatId, { age: enteredText });

        break;
      case "university":
        await this.sessionManager.updateUserInfo(chatId, {
          university: enteredText,
        });

        break;
      case "group":
        await this.sessionManager.updateUserInfo(chatId, {
          group: enteredText,
        });

        break;
      case "course":
        await this.sessionManager.updateUserInfo(chatId, {
          course: enteredText,
        });

        break;
      case "source":
        await this.sessionManager.updateUserInfo(chatId, {
          source: enteredText,
        });

        break;
      case "contact":
        if (enteredText === "Нікнейм") {
          await this.sessionManager.updateUserInfo(chatId, {
            contact: "@" + message?.from?.username,
          });
        }

        break;
    }
  }
  private async handleRegistrationStep(
    step: string,
    chatId: number,
    enteredText?: string,
  ) {
    switch (step) {
      case "name":
        await this.sessionManager.updateRegistrationSteps(chatId, "age");
        await this.sender.sendKeyboardHTML(chatId, "Введіть вік", [
          [{ text: BACK }],
        ]);
        break;

      case "age":
        await this.sessionManager.updateRegistrationSteps(chatId, "university");
        await this.sender.sendKeyboardHTML(chatId, "Введіть університет", [
          [
            { text: "НУЛП" },
            { text: "ЛНУ" },
            { text: "КПІ" },
            { text: "Ще в школі" },
          ],
          [{ text: BACK }],
        ]);
        break;
      case "university":
        if (enteredText === "Ще в школі") {
          await this.sessionManager.updateUserInfo(chatId, { group: "XX-00" });
          await this.sessionManager.updateUserInfo(chatId, { course: 0 });

          await this.sessionManager.updateRegistrationSteps(chatId, "source");

          await this.sender.sendKeyboardHTML(
            chatId,
            "Введіть звідки ви дізналися про нас",
            [
              [{ text: "Соц. мережі" }],
              [{ text: "Спільноти в соц. мережах" }],
              [{ text: "На інших івентах" }],
              [{ text: "Інфостійки" }],
              [{ text: "Від друзів" }],
              [{ text: "Від викладачів " }],
              [{ text: "Оголошення на сайтах" }],
              [{ text: BACK }],
            ],
          );
        } else {
          await this.sessionManager.updateRegistrationSteps(chatId, "group");
          await this.sender.sendKeyboardHTML(
            chatId,
            "Введіть Вашу спеціальність",
            [[{ text: BACK }]],
          );
        }

        break;
      case "group":
        await this.sessionManager.updateRegistrationSteps(chatId, "course");
        await this.sender.sendKeyboardHTML(chatId, "Який Ви курс", [
          [{ text: "1" }, { text: "2" }],
          [{ text: "3" }, { text: "4" }],
          [{ text: "5" }, { text: "6" }],
          [{ text: BACK }],
        ]);
        break;
      case "course":
        await this.sessionManager.updateRegistrationSteps(chatId, "source");
        await this.sender.sendKeyboardHTML(
          chatId,
          "Введіть звідки ви дізналися про нас",
          [
            [{ text: "Соц. мережі" }],
            [{ text: "Спільноти в соц. мережах" }],
            [{ text: "На інших івентах" }],
            [{ text: "Інфостійки" }],
            [{ text: "Від друзів" }],
            [{ text: "Від викладачів " }],
            [{ text: "Оголошення на сайтах" }],
            [{ text: BACK }],
          ],
        );
        break;
      case "source":
        await this.sessionManager.updateRegistrationSteps(chatId, "contact");
        await this.sender.sendKeyboardHTML(
          chatId,
          "Поділіться своїми контактами",
          [
            [{ text: "Номер телефону", request_contact: true }],
            [{ text: "Нікнейм" }],
            [{ text: BACK }],
          ],
        );
        break;
      case "contact":
        const userData = (await this.sessionManager.getSession(chatId)).data
          .userInfo;
        await this.UserDb.createTeamMember(chatId, userData);
        await this.sceneNavigator.setScene(chatId, SceneEnum.Home);
        await this.sendLocalStageKeyboard(chatId, "Дякую за реєстрацію");

        break;
    }
  }
  private async sendLocalStageKeyboard(chatId: number, text: string) {
    let availableScenesNames: SceneEnum[];
    const currentScene = await this.sceneNavigator.getCurrentScene(chatId);
    const teamMember = await this.UserDb.getTeamMember(chatId);

    availableScenesNames = await this.sceneNavigator.getAvailableNextScenes(
      chatId,
      teamMember,
    );

    if (teamMember !== null) {
      availableScenesNames = [
        SceneEnum.AboutBest,
        SceneEnum.AboutCTF,
        SceneEnum.TeamInfo,
        SceneEnum.WithoutTeamsChat,
        SceneEnum.TestTask,
      ];
    }

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
  private chunkArray<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }
  public async handlePhoneNumber(message: Message) {
    const chatId = message.chat.id;
    if (chatId !== message.chat.id) return;
    const step = (await this.sessionManager.getSession(chatId)).data
      .registrationStep;
    const currentScene = (await this.sceneNavigator.getCurrentScene(chatId))
      .name;
    if (currentScene === SceneEnum.Registration && step === "contact") {
      await this.sessionManager.updateUserInfo(chatId, {
        contact: message?.contact?.phone_number,
      });
      await this.handleRegistrationStep(step, chatId);
    }
  }
}
