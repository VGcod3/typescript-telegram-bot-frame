import { SceneEnum } from "../enums/SceneEnum";

export interface SceneRoute {
  nextScenes: SceneEnum[] | null;
  prevScene: SceneEnum | null;
}

export type SceneRoutingScheme = Record<SceneEnum, SceneRoute>;

export const sceneRoutingScheme: SceneRoutingScheme = {
  [SceneEnum.Home]: {
    nextScenes: [SceneEnum.Users, SceneEnum.Pokemon, SceneEnum.Settings],
    prevScene: null,
  },
  [SceneEnum.Users]: {
    nextScenes: null,
    prevScene: SceneEnum.Home,
  },
  [SceneEnum.Notifications]: {
    nextScenes: null,
    prevScene: SceneEnum.Settings,
  },
  [SceneEnum.Language]: {
    nextScenes: null,
    prevScene: SceneEnum.Settings,
  },
  [SceneEnum.Theme]: {
    nextScenes: null,
    prevScene: SceneEnum.Settings,
  },
  [SceneEnum.Settings]: {
    nextScenes: [SceneEnum.Notifications, SceneEnum.Language, SceneEnum.Theme],
    prevScene: SceneEnum.Home,
  },
  [SceneEnum.Pokemon]: {
    nextScenes: [SceneEnum.GeneratePokemon, SceneEnum.GetAllPokemons],
    prevScene: SceneEnum.Home,
  },
  [SceneEnum.GeneratePokemon]: {
    nextScenes: null,
    prevScene: SceneEnum.Pokemon,
  },
  [SceneEnum.GetAllPokemons]: {
    nextScenes: null,
    prevScene: SceneEnum.Pokemon,
  },
} as const;

export const scenesMap = new Map<SceneEnum, SceneRoute>(
  Object.entries(sceneRoutingScheme).map(([key, value]) => [
    key as SceneEnum,
    value,
  ]),
);
