
import { set, ZodAny, ZodString } from "zod";
import { BotInstance } from "../../../BotInstance";
import { SceneNavigator } from "../../../SceneNavigator";
import { SceneEnum } from "../../../scenesList";
import { SessionManager } from "../../../SessionManager";
import { UserDb } from "../../db.utils/user.utils";
import { age, surname, university, group, course, source, contact, name } from "../../z.schemas/schema.TeamMember";
import { MessageType, Sender } from "../sender";
import { startMessage } from "../hello.module/home.service";
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
        private readonly sessionManager: SessionManager
    ) {
        this.UserDb = UserDb;
        this.sender = sender;
        this.sessionManager = sessionManager;
        this.sceneNavigator = sceneNavigator;
    }


    private bot = BotInstance.getInstance();
    public temporaryData = new Map<number, any[]>();

    async handleKeyboard(message: MessageType) {
        const chatId = message.chat.id;
        const availableSceneNames =
            await this.sceneNavigator.getAvailableNextScenes(chatId);

        if (message.text === "Назад") {
            this.sceneNavigator.goBack(chatId);
            this.sessionManager.updateRegistrationStep(chatId, RegistrationSteps.ASK_NAME);
            console.log("Registration Available scenes: " + availableSceneNames);
            console.log("Registration Entered text: " + message.text);

        } else if (availableSceneNames.includes(message.text as SceneEnum)) {
            this.sceneNavigator.setScene(chatId, message.text as SceneEnum);
        } else {
            await this.sender.sendText(chatId, "Такого варіанту не існує");
        }

        await this.sendLocalStageKeyboard(chatId, startMessage);
    }

    async setUserStep(chatId: number, step: RegistrationSteps) {
        this.sessionManager.updateRegistrationStep(chatId, step);
    }
    async handleUserInput(schema: any, chatId: number, nextStep: RegistrationSteps, isNumber = false) {
        const currentScene = (await this.sessionManager.getSession(chatId)).data.RegistrationStep.toString();
        this.bot.once("message", async (message: MessageType) => {
            const text = message.text;
            const contact = message.contact?.phone_number;
            if (isNumber) {
                const number = Number(text);
                if (!schema.safeParse(number).success) {
                    await this.sender.sendText(chatId, `${schema.safeParse(number).error.errors[0]?.message}`);
                    return;
                }
                else {
                    this.temporaryData.get(chatId)?.push(number);
                    await this.setUserStep(chatId, nextStep);
                }

            }
            else if (currentScene === RegistrationSteps.ASK_CONTACT.toString()) {
                if (contact) {
                    console.log("Contact: " + contact);
                    this.temporaryData.get(chatId)?.push(contact)
                    await this.setUserStep(chatId, nextStep);
                } else {
                    console.log("No contact: " + contact);
                    await this.sender.sendText(chatId, "Будь ласка, поділіться номером телефону");
                    return;
                }

            }
            else {
                if (!schema.safeParse(text).success) {
                    await this.sender.sendText(chatId, `${schema.safeParse(text).error.errors[0]?.message}`);
                    return;
                }
                else {
                    this.temporaryData.get(chatId)?.push(text);
                    await this.setUserStep(chatId, nextStep);
                }


            }
        });
    }
    async getUserStep(chatId: number): Promise<RegistrationSteps> {
        const userSession = await this.sessionManager.getSession(chatId);
        if (!userSession.data.RegistrationStep) {
            await this.setUserStep(chatId, RegistrationSteps.ASK_NAME);
        }
        return userSession.data.RegistrationStep;
    }

    async sendLocalStageKeyboard(chatId: number, text: string) {
        const currentScene = await this.sceneNavigator.getCurrentScene(chatId);

        const availableScenesNames =
            await this.sceneNavigator.getAvailableNextScenes(chatId);

        const canGoBack = !!currentScene.prevScene;

        await this.sender.sendKeyboard(chatId, text, [
            availableScenesNames.map((scene) => ({ text: scene })),

            canGoBack ? [{ text: "Назад" }] : [],
        ]);
    }

    async collectData(message: MessageType) {
        const chatId = message.chat.id;

        if (!this.temporaryData.has(chatId) && !await this.UserDb.getTeamMember(chatId)) {
            this.temporaryData.set(chatId, []);
        }

        console.log("Registration scene text: " + message.text);


        const currentStep = await this.getUserStep(chatId);
        console.log("Current step: " + currentStep);

        switch (currentStep) {

            case RegistrationSteps.ASK_NAME:
                await this.sender.sendKeyboard(chatId, "Введіть ваше ім'я", [[]])
                await this.handleUserInput(name, chatId, RegistrationSteps.ASK_SURNAME);
                break;

            case RegistrationSteps.ASK_SURNAME:
                await this.sender.sendKeyboard(chatId, "Введіть ваше прізвище", [[]]);
                await this.handleUserInput(surname, chatId, RegistrationSteps.ASK_AGE);
                break;

            case RegistrationSteps.ASK_AGE:
                await this.sender.sendKeyboard(chatId, "Введіть ваш вік", [[]])
                await this.handleUserInput(age, chatId, RegistrationSteps.ASK_UNIVERSITY, true);
                break;

            case RegistrationSteps.ASK_UNIVERSITY:
                await this.sender.sendKeyboard(chatId, "Введіть ваш університет", [
                    [{ text: "НУЛП" }, { text: "ЛНУ" }, { text: "НЛУУ" }],
                ], true);
                await this.handleUserInput(university, chatId, RegistrationSteps.ASK_GROUP);
                break;

            case RegistrationSteps.ASK_GROUP:
                await this.sender.sendText(chatId, "Введіть вашу групу");
                await this.handleUserInput(group, chatId, RegistrationSteps.ASK_COURSE);
                break;

            case RegistrationSteps.ASK_COURSE:
                await this.sender.sendKeyboard(chatId, "Введіть ваш курс", [
                    [{ text: "1" }, { text: "2" }, { text: "3" }],
                    [{ text: "4" }, { text: "5" }, { text: "6" }],
                ], true);
                await this.handleUserInput(course, chatId, RegistrationSteps.ASK_SOURCE, true);
                break;

            case RegistrationSteps.ASK_SOURCE:
                await this.sender.sendText(chatId, "Як ви дізналися про нас?");
                await this.handleUserInput(source, chatId, RegistrationSteps.ASK_CONTACT);
                break;

            case RegistrationSteps.ASK_CONTACT:
                await this.sender.sendKeyboard(chatId, "Поіділться буль ласка номером телефону", [
                    [{ text: "Поділитися номером", request_contact: true }],
                ], true);
                await this.handleUserInput(source, chatId, RegistrationSteps.FINISHED);

                break;
            case RegistrationSteps.FINISHED:
                this.temporaryData.delete(chatId);
                if (await this.UserDb.getTeamMember(chatId)) {
                    await this.sender.sendText(chatId, "Ви вже зареєстровані");
                    return;
                } else {
                    await this.sender.sendText(chatId, "Дякуємо за реєстрацію");
                    this.UserDb.createTeamMember(chatId, this.temporaryData.get(chatId));
                }
                break;
        }
    }


}