import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

export class AdminScene {
  public static enter() {
    console.log("Admin Scene entered");

    new AdminController(new AdminService());
  }
}
