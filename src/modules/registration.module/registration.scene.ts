import { SceneNavigator } from "../../../SceneNavigator";
import { SessionManager } from "../../../SessionManager";
import { UserDb } from "../../db.utils/user.utils";
import { Sender } from "../sender";
import { RegistrationController } from "./registration.controller";
import { RegistrationService } from "./registration.service";

export class RegistrationScene {
    public static enter() {
        console.log("Registration scene entered");

        const userDb = new UserDb();
        const sender = new Sender();

        const sessionManager = new SessionManager(userDb);
        const sceneNavigator = new SceneNavigator(sessionManager);

        const registrationService = new RegistrationService(
            userDb,
            sender,
            sceneNavigator,
            sessionManager
        );

        new RegistrationController(registrationService);
    }
}
