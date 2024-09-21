import { HomeScene } from "./src/modules/hello.module/home.scene";
import { RegistrationScene } from "./src/modules/registration.module/registration.scene";
import { TeamCreateScene } from "./src/modules/teamCreate.module/teamCreate.scene";
import { TeamHandleScene } from "./src/modules/teamHandle.module/teamHandle.scene";
import { TeamInfoScene } from "./src/modules/teamInfo.module/teamInfo.scene";
import { TeamJoinScene } from "./src/modules/teamJoin.module/teamJoin.scene";
export enum SceneEnum {
  Home = "home",
  Registration = "Реєстрація",
  AboutBest = "Про бест",
  AboutCTF = "Про івент",
  EventLocation = "Місце проведення",
  EventChat = "Чат",
  TestTask = "Тестове завдання",
  EventRules = "Правила івенту",
  TeamInfo = "Інформація про команду",
  TeamHandle = "Моя команда",
  TeamCreate = "Створити команду",
  TeamJoin = "Приєднатися до команди",
  TeamExit = "Вийти з команди",
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
  public readonly TeamHandleScene = TeamHandleScene;
  public readonly TeamCreateScene = TeamCreateScene;
  public readonly TeamInfoScene = TeamInfoScene;
  public readonly TeamJoinScene = TeamJoinScene;
  public allScenes: iScene[] = [
    {
      name: SceneEnum.Home,
      nextScenes: [
        SceneEnum.Registration,
        SceneEnum.AboutBest,
        SceneEnum.AboutCTF,
      ],
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
      name: SceneEnum.TeamHandle,
      nextScenes: [SceneEnum.TeamJoin, SceneEnum.TeamCreate],
      prevScene: SceneEnum.Home,
      enter: this.TeamHandleScene.enter,
    },
    {
      name: SceneEnum.TeamJoin,
      nextScenes: null,
      prevScene: SceneEnum.TeamHandle,
      enter: this.TeamJoinScene.enter,
    },
    {
      name: SceneEnum.TeamCreate,
      nextScenes: null,
      prevScene: SceneEnum.TeamHandle,
      enter: this.TeamCreateScene.enter,
    },
    {
      name: SceneEnum.TeamInfo,
      nextScenes: [SceneEnum.TeamExit],
      prevScene: SceneEnum.Home,
      enter: this.TeamInfoScene.enter,
    },
  ];
}
