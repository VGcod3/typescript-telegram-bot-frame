import { HomeScene } from "./src/modules/hello.module/home.scene";
import { RegistrationScene } from "./src/modules/registration.module/registration.scene";
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
  JoinTeam = "Приєднатись до комади",
  CreateTeam = "Створити команду",
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
      enter: this.HomeScene.enter,
    },
    {
      name: SceneEnum.Registration,
      nextScenes: null,
      prevScene: SceneEnum.Home,
      enter: this.RegistrationScene.enter,
    }, 
   ];
}
