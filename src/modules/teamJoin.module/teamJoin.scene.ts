import { TeamJoinController } from "./teamJoin.controller";
import { TeamJoinService } from "./teamJoin.service";



export class TeamJoinScene {
  public static enter() {
    console.log("TeamHandle Scene entered");

    new TeamJoinController(new TeamJoinService());
  }
}
