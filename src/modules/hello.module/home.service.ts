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
const aboutEventText = `
<u><i>Щоб знати як захищати, треба знати як атакувати!</i></u>

<b>BEST CTF</b> — це командні змагання з інформаційної безпеки, які проводяться у форматі "захоплення прапора", де команди намагаються знайти більше вразливостей в системі, і використовуючи їх отримати секретні дані.

<b>Змагання будуть відбуватися 16-17 листопада.</b>

Наш сайт: <a href="google.com">(посилання)</a>
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
    const teamMember = await this.UserDb.getTeamMember(chatId);
    if (teamMember){
      
    }
    if (user) {
      await this.sender.sendText(chatId, "Радий знову тебе бачити!");

    } else {
      await this.UserDb.createUser(chatId);
      await this.sender.sendText(chatId, "Ласкаво просимо, студенте!");
    }


    await this.sendLocalStageKeyboard(chatId, startMessage);
  }
  async handleAboutBest(message: MessageType) {
    const chatId = message.chat.id;
    this.sender.sendText(chatId, aboutBestText)
  }
  handleAboutCTF(message: MessageType) {
    const chatId = message.chat.id;
    this.sender.sendText(chatId, aboutEventText)
  }
  async handleKeyboard(message: MessageType) {
    const chatId = message.chat.id;

    const availableSceneNames =
      await this.sceneNavigator.getAvailableNextScenes(chatId);
    console.log("Home Available scenes: " + availableSceneNames);
    console.log("Home Entered text: " + message.text);

    if (message.text === "Назад") {
      this.sceneNavigator.goBack(chatId);
    } else if (availableSceneNames.includes(message.text as SceneEnum)) {
      if (message.text !== "Реєстрація") {
        this.sceneNavigator.setScene(chatId, message.text as SceneEnum);
      }
      if (message.text === "Реєстрація" && await this.UserDb.getTeamMember(chatId) === null) {
        this.sceneNavigator.setScene(chatId, message.text as SceneEnum);
        this.sender.sendKeyboard(chatId, "Перед початком реєстрації підтвердьте дозвіл на обробку ваших даних", [
          [{ text: "Почати реєстрацію" }],
          [{ text: "Назад" }]
        ], true);
      }
    } else {
      await this.sender.sendText(chatId, "Такого варіанту не існує");
      await this.sendLocalStageKeyboard(chatId, startMessage);
    }

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

  private async sendLocalStageKeyboard(chatId: number, text: string) {
    const currentScene = await this.sceneNavigator.getCurrentScene(chatId);

    const availableScenesNames =
      await this.sceneNavigator.getAvailableNextScenes(chatId);

    const canGoBack = !!currentScene.prevScene;

    await this.sender.sendKeyboard(chatId, text, [
      availableScenesNames.map((scene) => ({ text: scene })),

      canGoBack ? [{ text: "Назад" }] : [],
    ]);
  }
}
