import { MessageType, Sender } from "../sender";
import { UserDb } from "../../db.utils/user.utils";
import { SceneNavigator } from "../../../SceneNavigator";
import { SessionManager } from "../../../SessionManager";
import { SceneEnum } from "../../../scenesList";
export const startMessage = `
<b>Цей бот допоможе тобі:</b>
- Зареєструватися на BEST CTF
- Розпочати тестове завдання
- Знайти необхідну інформацію про CTF, такі як розклад, правила
- Отримувати сповіщення від організаторів у реальному часі
- Створювати та приєднувати людей до своєї команди
- Визначити чи ти 0 чи 1
`;
const aboutBestText = `
<a href="google.com">BEST Lviv</a>  — європейська студентська волонтерська організація з 85 осередками в 30 країнах.

Організація спрямована на розвиток студентів у сф'ері технологій, інженерії та менеджменту.

Наша місія — розвиток студентів, а візія — сила у різноманітті

Щороку, ми організовуємо близько 4 - х масштабних івентів, серед яких:
HACKath0n, BEC(Best Engineering Competition), BTW(BEST Training Week) та BCI(Best Company Insight)

Детальніше про ці івенти ви можете дізнатися в нашому інстаграмі:
<a href='https://www.instagram.com/best_lviv/ '>https://www.instagram.com/best_lviv/ </a>

`;
export class HomeService {
  private readonly UserDb: UserDb;
  private readonly sender: Sender;
  private readonly sceneNavigator: SceneNavigator;
  private readonly sessionManager: SessionManager;

  constructor() {
    this.UserDb = new UserDb();
    this.sender = new Sender();

    this.sessionManager = new SessionManager(this.UserDb);
    this.sceneNavigator = new SceneNavigator(this.sessionManager);
  }

  async handleStart(message: MessageType) {
    const chatId = message.chat.id;

    await this.sessionManager.initSession(chatId);

    const user = await this.UserDb.getUser(chatId);

    if (user) {
      await this.sender.sendText(chatId, "Радий знову тебе бачити!" + startMessage);


    } else {
      await this.UserDb.createUser(chatId);
      await this.sender.sendText(chatId, "Ласкаво просимо, студенте!" + startMessage);
    }

    await this.sendLocalStageKeyboard(chatId);
  }
  async handleAboutBest(message: MessageType) {
    const chatId = message.chat.id;
    this.sender.sendText(chatId, aboutBestText)
  }
  async handleKeyboard(message: MessageType) {
    const chatId = message.chat.id;

    const availableSceneNames =
      await this.sceneNavigator.getAvailableNextScenes(chatId);

    if (message.text === "Назад") {
      this.sceneNavigator.goBack(chatId);
    } else if (availableSceneNames.includes(message.text as SceneEnum)) {
      this.sceneNavigator.setScene(chatId, message.text as SceneEnum);
    } else {
      await this.sender.sendText(chatId, "Такого варіанту не існує");
    }

    await this.sendLocalStageKeyboard(chatId);
  }

  async handleUsers(message: MessageType) {
    const chatId = message.chat.id;

    try {
      const users = await this.UserDb.getAllUsers();

      await this.sender.sendText(chatId, `Users: ${users.length}`);
    } catch (error) {
      await this.sender.sendText(chatId, `Error: ${error}`);
    }
  }

  private async sendLocalStageKeyboard(chatId: number) {
    const currentScene = await this.sceneNavigator.getCurrentScene(chatId);

    const availableScenesNames =
      await this.sceneNavigator.getAvailableNextScenes(chatId);

    const canGoBack = !!currentScene.prevScene;

    await this.sender.sendKeyboard(chatId, "Виберіть дію", [
      availableScenesNames.map((scene) => ({ text: scene })),

      canGoBack ? [{ text: "Назад" }] : [],
    ]);
  }
}
