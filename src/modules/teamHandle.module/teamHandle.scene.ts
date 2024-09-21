import { TeamHandleController } from "./teamHandle.controller";

import { TeamHandleService } from "./teamHandle.service";

export class TeamHandleScene {
  public static enter() {
    console.log("TeamHandle Scene entered");

    new TeamHandleController(new TeamHandleService());
  }
}
