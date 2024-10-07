import { HandleTeamAdminController } from "./handleTeamAdmin.controller";
import { HandleTeamAdminService } from "./handleTeamAdmin.service";

export class HandleTeamAdminScene {
  public static enter() {
    console.log("HandleTeamAdmin Scene entered");

    new HandleTeamAdminController(new HandleTeamAdminService());
  }
}
