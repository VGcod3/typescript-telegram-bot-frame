import { HomeScene } from "./src/modules/hello.module/home.scene";
import { PostingScene } from "./src/modules/posting.module/posting.scene";
import { RegistrationScene } from "./src/modules/registration.module/registration.scene";

export enum SceneEnum {
  Home = "home",
  Registration = "Реєстрація",
  AboutBest = "aboutBest",
  AboutCTF = "aboutCTF",
  // Users = "/users",
  // Settings = "settings",
  // Notifications = "notifications",

  // Posting = "posting",
}

export interface iScene {
  name: SceneEnum;
  nextScenes: SceneEnum[] | null;
  prevScene: SceneEnum | null;
  enter: () => void;
}
export class AllScenes {
  public readonly HomeScene = HomeScene;
  public readonly RegistrationScene = RegistrationScene;

  public allScenes: iScene[] = [
    {
      name: SceneEnum.Home,
      nextScenes: [SceneEnum.Registration, SceneEnum.AboutBest, SceneEnum.AboutCTF],
      prevScene: null,
      // module: HomeScene,
      enter: this.HomeScene.enter,
    },
    {
      name: SceneEnum.Registration,
      nextScenes: null,
      prevScene: SceneEnum.Home,
      // module: PostingScene,
      enter: this.RegistrationScene.enter,
    }
  ];
}
