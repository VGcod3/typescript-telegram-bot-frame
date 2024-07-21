export enum SceneEnum {
  Home = "home",
  Users = "/users",
  Settings = "settings",
  Notifications = "notifications",
  Language = "language",
  Theme = "theme",
}

export const allScenes = [
  {
    name: SceneEnum.Home,
    nextScenes: [SceneEnum.Users, SceneEnum.Settings],
    prevScene: null,
  },
  {
    name: SceneEnum.Users,
    nextScenes: null,
    prevScene: SceneEnum.Home,
  },

  {
    name: SceneEnum.Notifications,
    nextScenes: null,
    prevScene: SceneEnum.Settings,
  },
  {
    name: SceneEnum.Language,
    nextScenes: null,
    prevScene: SceneEnum.Settings,
  },
  {
    name: SceneEnum.Theme,
    nextScenes: null,
    prevScene: SceneEnum.Settings,
  },
  {
    name: SceneEnum.Settings,
    nextScenes: [SceneEnum.Notifications, SceneEnum.Language, SceneEnum.Theme],
    prevScene: SceneEnum.Home,
  },
];
