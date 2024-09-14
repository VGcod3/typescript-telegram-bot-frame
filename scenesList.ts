import { HomeScene } from "./src/modules/hello.module/home.scene";
import { PostingScene } from "./src/modules/posting.module/posting.scene";
import { RegistrationScene } from "./src/modules/registration.module/registration.scene";
import { TeamScene } from "./src/modules/teamMember.module/teamMember.scene";
export enum SceneEnum {
  Home = "home",
  Registration = "Реєстрація",
  AboutBest = "Про бест",
  AboutCTF = "Про івент",
  Team = "Команда",
  EventLocation = "Місце проведення",
  TeamInfo = "Інформація про команду",
  EventChat = "Чат",
  TestTask = "Тестове завдання",
  EventRules = "Правила івенту",
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
  // public readonly PostingScene = PostingScene;
  public readonly TeamScene = TeamScene;
  

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
    }, 
    {
      name: SceneEnum.Team,
      nextScenes: [SceneEnum.AboutBest, SceneEnum.AboutCTF, SceneEnum.EventLocation, SceneEnum.TeamInfo, SceneEnum.EventChat, SceneEnum.TestTask, SceneEnum.EventRules],
      prevScene: null,
      // module: PostingScene,
      enter: this.TeamScene.enter,
    },
   ];
}
