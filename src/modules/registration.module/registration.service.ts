
import { set } from "zod";
import { BotInstance } from "../../../BotInstance";
import { SceneNavigator } from "../../../SceneNavigator";
import { SceneEnum } from "../../../scenesList";
import { SessionManager } from "../../../SessionManager";
import { UserDb } from "../../db.utils/user.utils";
import { age, surname, university, group, course, source, contact, name } from "../../z.schemas/schema.TeamMember";
import { MessageType, Sender } from "../sender";
export enum RegistrationSteps {
    START = "start",
    ASK_NAME = "ask_name",
    ASK_AGE = "ask_age",
    FINISHED = "finished"
}


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

    async setUserStep(chatId: number, step: RegistrationSteps) {
        this.sessionManager.updateRegistrationStep(chatId, step);
    }

    async getUserStep(chatId: number): Promise<RegistrationSteps> {
        const userSession = await this.sessionManager.getSession(chatId);
        if (!userSession.data.RegistrationStep ) {
            await this.setUserStep(chatId, RegistrationSteps.START);
        }
        return userSession.data.RegistrationStep;
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


}