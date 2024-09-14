
import { set, ZodAny, ZodString } from "zod";
import { BotInstance } from "../../../BotInstance";
import { SceneNavigator } from "../../../SceneNavigator";
import { SceneEnum } from "../../../scenesList";
import { SessionManager } from "../../../SessionManager";
import { UserDb } from "../../db.utils/user.utils";
import { age, surname, university, group, course, source, contact, name } from "../../z.schemas/schema.TeamMember";
import { MessageType, Sender } from "../sender";
import { aboutBestText, aboutChatText, aboutEventText, locationText, rulesText, startMessage, testTaskText } from "../../sharedText";



export class TeamService {
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

        } else if (availableSceneNames.includes(message.text as SceneEnum)) {
            this.sceneNavigator.setScene(chatId, message.text as SceneEnum);
        } else {
            await this.sender.sendText(chatId, "Такого варіанту не існує");
        }

        await this.sendLocalStageKeyboard(chatId, startMessage);
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

        const availableScenesNames =
            await this.sceneNavigator.getAvailableNextScenes(chatId);

        const scenesButtons = availableScenesNames.map((scene) => ({ text: scene }));

        // Split buttons into groups of two per row
        const keyboardButtons = this.chunkArray(scenesButtons, 2);

        // const canGoBack = !!currentScene.prevScene;
        // if (canGoBack) {
        //   keyboardButtons.push([{ text: "Назад" }]);
        // }


        await this.sender.sendKeyboard(chatId, text, keyboardButtons);
    }
    async handleAboutBest(message: MessageType) {
        const chatId = message.chat.id;
        this.sender.sendText(chatId, aboutBestText)
    }
    async handleAboutCTF(message: MessageType) {
        const chatId = message.chat.id;
        this.sender.sendText(chatId, aboutEventText)
    }
    async handleLocation(message: MessageType) {
        const chatId = message.chat.id;
        this.sender.sendText(chatId, locationText)
    }
    async handleChat(message: MessageType) {
        const chatId = message.chat.id;
        this.sender.sendText(chatId, aboutChatText)
    }
    async handleTestTask(message: MessageType) {
        const chatId = message.chat.id;
        this.sender.sendText(chatId, testTaskText)
    }

    async handleRules(message: MessageType) {
        const chatId = message.chat.id;
        this.sender.sendText(chatId, rulesText)
    }

    async handleTeam(message: MessageType) {
        const chatId = message.chat.id;
        const team = await this.UserDb.getTeamMember(chatId);
        if(team?.teamId === null){
            this.sender.sendText(chatId, "Ви ще не в команді")
        }
    }   
}