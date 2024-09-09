
import { BotInstance } from "../../../BotInstance";
import { SceneNavigator } from "../../../SceneNavigator";
import { SceneEnum } from "../../../scenesList";
import { SessionManager } from "../../../SessionManager";
import { UserDb } from "../../db.utils/user.utils";
import { age, surname, university, group, course, source, contact, name } from "../../z.schemas/schema.TeamMember";
import { MessageType, Sender } from "../sender";



export class RegistrationService {
    constructor(
        private readonly UserDb: UserDb,
        // private readonly teamMemberDb: teamMemberDb,
        private readonly sender: Sender,
        private readonly sceneNavigator: SceneNavigator,
        private readonly sessionManager: SessionManager
    ) {
        this.UserDb = UserDb;
        // this.teamMemberDb = teamMemberDb;
        this.sender = sender;
        this.sessionManager = sessionManager;
        this.sceneNavigator = sceneNavigator;
    }

    async handleRegistration(message: MessageType) {
        const chatId = message.chat.id;
        
        await this.collectData(chatId)

        await this.sendLocalStageKeyboard(chatId);
    }


    async handleKeyboard(message: MessageType) {
        const chatId = message.chat.id;

        const availableSceneNames =
            await this.sceneNavigator.getAvailableNextScenes(chatId);

        if (message.text === "Back") {
            this.sceneNavigator.goBack(chatId);
        } else if (availableSceneNames.includes(message.text as SceneEnum)) {
            this.sceneNavigator.setScene(chatId, message.text as SceneEnum);
        } else {
            await this.sender.sendText(chatId, "Invalid option");
        }

        await this.sendLocalStageKeyboard(chatId);
    }

    private async sendLocalStageKeyboard(chatId: number) {
        const currentScene = await this.sceneNavigator.getCurrentScene(chatId);

        const availableScenesNames =
            await this.sceneNavigator.getAvailableNextScenes(chatId);

        const canGoBack = !!currentScene.prevScene;

        await this.sender.sendKeyboard(chatId, "Choose an option", [
            availableScenesNames.map((scene) => ({ text: scene })),

            canGoBack ? [{ text: "Back" }] : [],
        ]);
    }

    private async collectData(chatId: number) {

        const userName = await this.handleUserInput(chatId, "Введіть ім'я", name);
        console.log(`Name: ${userName}`);

        const userSurname = await this.handleUserInput
            (
                chatId,
                "Введіть прізвище",
                surname,
            );
        console.log(`Surname: ${userSurname}`);

        const userAge = await this.handleUserInput
            (
                chatId,
                "Введіть вік",
                age,
                true,
            );
        console.log(`Age: ${userAge}`);

        const userUniversity = await this.handleUserInput
            (
                chatId,
                "Введіть університет",
                university,
            );
        console.log(`University: ${userUniversity}`);

        const userGroup = await this.handleUserInput
            (
                chatId,
                "Введіть групу",
                group
            );
        console.log(`Group: ${userGroup}`);

        const userCourse = await this.handleUserInput
            (
                chatId,
                "Введіть курс",
                course,
                true,
            );
        console.log(`Course: ${userCourse}`);

        const userSource = await this.handleUserInput
            (
                chatId,
                "Як дізналися про проєкт?",
                source,
            );
        console.log(`Source: ${userSource}`);

        const userContact = await this.handleUserContact
            (
                chatId,
                "Введіть контакт",
                contact,
            );

        console.log(`Contact: ${userContact}`);
        const user = {
            name: userName,
            surname: userSurname,
            age: userAge,
            university: userUniversity,
            group: userGroup,
            course: userCourse,
            source: userSource,
            contact: userContact
        }

        this.UserDb.createTeamMember(chatId, user)
    }

    private async handleUserInput
        (
            chatId: number,
            promptText: string,
            schema: any,
            isNumber = false,
        ): Promise<string | number> {
        return new Promise(async (resolve) => {
            const bot = BotInstance.getInstance();
            await bot.sendMessage({ chat_id: chatId, text: promptText });

            const messageHandler = async (message: MessageType) => {
                if (message.chat.id !== chatId) return;



                let input = message.text;
                if (isNumber) {
                    const parsedNumber = parseInt(input!);
                    if (await this.safeParse
                        (chatId, schema, parsedNumber)) {
                        bot.removeListener("message", messageHandler);
                        resolve(parsedNumber);
                    } else {
                        bot.removeListener("message", messageHandler);
                        resolve(
                            await this.handleUserInput
                                (

                                    chatId,
                                    promptText,
                                    schema,
                                    isNumber,
                                ),
                        );
                    }
                } else {
                    if (await this.safeParse
                        (chatId, schema, input)) {
                        bot.removeListener("message", messageHandler);
                        resolve(input!);
                    } else {
                        bot.removeListener("message", messageHandler);
                        resolve(
                            await this.handleUserInput
                                (

                                    chatId,
                                    promptText,
                                    schema,
                                    isNumber,
                                ),
                        );
                    }
                }
            };

            bot.once("message", messageHandler);
        });
    }
    private async handleUserContact(

        chatId: number,
        promptText: string,
        schema: any,
    ): Promise<number> {
        return new Promise(async (resolve) => {
            const bot = BotInstance.getInstance();
            await bot.sendMessage({
                chat_id: chatId,
                text: promptText,
                reply_markup: {
                    keyboard: [[{ text: "Поділитися контактом", request_contact: true }]],
                    one_time_keyboard: true,
                    resize_keyboard: true,
                },
            });

            const contactHandler = async (message: MessageType) => {


                if (message.contact) {
                    const input = Number(message.contact.phone_number.replace("+", ""));
                    if (await this.safeParse
                        (chatId, schema, input)) {
                        await bot.sendMessage({
                            chat_id: chatId,
                            text: "Дякуємо!",
                            reply_markup: { remove_keyboard: true },
                        });
                        bot.removeListener("message", contactHandler);
                        resolve(input);
                    } else {
                        bot.removeListener("message", contactHandler);
                        resolve(
                            await this.handleUserContact(chatId, promptText, schema),
                        );
                    }
                } else {
                    await bot.sendMessage({
                        chat_id: chatId,
                        text: "Будь ласка, поділіться своїм контактом",
                        reply_markup: {
                            keyboard: [
                                [{ text: "Поділитися контактом", request_contact: true }],
                            ],
                            one_time_keyboard: true,
                            resize_keyboard: true,
                        },
                    });
                    bot.removeListener("message", contactHandler);
                    resolve(await this.handleUserContact(chatId, promptText, schema));
                }
            }


            bot.once("message", contactHandler);
        });
    };
    private async safeParse
        (
            chatId: number,
            schema: any,
            data: any,
        ): Promise<boolean> {
        const bot = BotInstance.getInstance();
        const result = schema.safeParse
            (data);
        if (!result.success) {
            await bot.sendMessage({
                chat_id: chatId,
                text: `${result.error.errors[0]?.message}`,
            });
            console.log(result.error.errors);
            return false;
        }
        return true;
    };
}