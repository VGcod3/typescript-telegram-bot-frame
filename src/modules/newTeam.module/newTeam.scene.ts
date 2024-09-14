import { SceneNavigator } from "../../../SceneNavigator";
import { SessionManager } from "../../../SessionManager";
import { UserDb } from "../../db.utils/user.utils";
import { Sender } from "../sender";
import { NewTeamController } from "./newTeam.controller";
import { NewTeamService } from "./newTeam.service";

export class NewTeamScene {
    public static enter() {
        console.log("Team scene entered");

        const userDb = new UserDb();
        const sender = new Sender();

        const sessionManager = new SessionManager(userDb);
        const sceneNavigator = new SceneNavigator(sessionManager);

        const newTeamService = new NewTeamService(
            userDb,
            sender,
            sceneNavigator,
            sessionManager
        );

        new NewTeamController(newTeamService);
    }
}
