import { TeamCreateController } from "./teamCreate.controller";
import { TeamCreateService } from "./teamCreate.service";

export class TeamCreateScene {
  public static enter() {
    console.log("Team create Scene entered");

    new TeamCreateController(new TeamCreateService());
  }
}
