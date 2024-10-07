import { TeamJoinController } from "./teamJoin.controller";
import { TeamJoinService } from "./teamJoin.service";



export class TeamJoinScene {
  public static enter() {
    console.log("TeamJoin Scene entered");

    new TeamJoinController(new TeamJoinService());
  }
}
