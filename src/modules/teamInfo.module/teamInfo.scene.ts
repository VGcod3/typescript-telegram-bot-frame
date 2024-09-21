
import { TeamInfoController } from "./teamInfo.controller";
import { TeamInfoService } from "./teamInfo.service";

export class TeamInfoScene {
  public static enter() {
    console.log("TeamHandle Scene entered");

    new TeamInfoController(new TeamInfoService());
  }
}
