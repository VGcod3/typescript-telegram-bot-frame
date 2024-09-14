import { SceneNavigator } from "../../../SceneNavigator";
import { SessionManager } from "../../../SessionManager";
import { UserDb } from "../../db.utils/user.utils";
import { Sender } from "../sender";
import { TeamController } from "./team.controller";
import { TeamService } from "./team.service";

export class TeamScene {
    public static enter() {
        console.log("Team scene entered");

        const userDb = new UserDb();
        const sender = new Sender();

        const sessionManager = new SessionManager(userDb);
        const sceneNavigator = new SceneNavigator(sessionManager);

        const teamService = new TeamService(
            userDb,
            sender,
            sceneNavigator,
            sessionManager
        );

        new TeamController(teamService);
    }
}
