import { HomeScene } from "./src/modules/hello.module/home.scene";
import { PostingScene } from "./src/modules/posting.module/posting.scene";
import { RegistrationScene } from "./src/modules/registration.module/registration.scene";
import { TeamScene } from "./src/modules/teamMember.module/teamMember.scene";
export enum SceneEnum {
  Home = "home",
  Registration = "Реєстрація",
  AboutBest = "Про бест",
  AboutCTF = "Про івент",
  EventLocation = "Місце проведення",
  Team = "Інформація про команду",
  EventChat = "Чат",
  TestTask = "Тестове завдання",
  EventRules = "Правила івенту",

  NewTeam = "",
  JoinTeam = "Приєднатись до комади",
  CreateTeam = "Створити команду",

  ExistTeam = "",
  

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
      enter: this.HomeScene.enter,
    },
    {
      name: SceneEnum.Registration,
      nextScenes: null,
      prevScene: SceneEnum.Home,
      enter: this.RegistrationScene.enter,
    }, 
    {
      name: SceneEnum.Team,
      nextScenes: [SceneEnum.AboutBest, SceneEnum.AboutCTF, SceneEnum.EventLocation, SceneEnum.Team, SceneEnum.EventChat, SceneEnum.TestTask, SceneEnum.EventRules],
      prevScene: null,
      enter: this.TeamScene.enter,
    },
    {
      name: SceneEnum.NewTeam,
      nextScenes: [SceneEnum.JoinTeam, SceneEnum.CreateTeam],
      prevScene: SceneEnum.Team,
      enter: this.TeamScene.enter,
    },
   ];
}

// Users = "/users",
// Settings = "settings",
// Notifications = "notifications",

// Posting = "posting",