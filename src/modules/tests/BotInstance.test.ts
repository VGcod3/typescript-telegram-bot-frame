import { BotInstance } from "../BotInstance";
import { mockTelegramBot } from "../../../mocks/telegram.mock";

jest.mock("typescript-telegram-bot-api", () => ({
  TelegramBot: jest.fn().mockImplementation(() => mockTelegramBot),
}));

describe("BotInstance", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv, TELEGRAM_BOT_TOKEN: "test-token" };
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    (BotInstance as any).instance = undefined; // eslint-disable-line @typescript-eslint/no-explicit-any
  });

  describe("getInstance", () => {
    it("should create a singleton instance", () => {
      const instance1 = BotInstance.getInstance();
      const instance2 = BotInstance.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe("middleware", () => {
    it("should register middleware on initialization", () => {
      BotInstance.getInstance();
      expect(BotInstance.middlewareManager).toBeDefined();
    });

    it("should allow adding new middleware", () => {
      const instance = BotInstance.getInstance(); // eslint-disable-line @typescript-eslint/no-unused-vars
      const mockMiddleware = jest.fn();

      BotInstance.middlewareManager.use(mockMiddleware);
      expect(BotInstance.middlewareManager.getMiddleware()).toContain(
        mockMiddleware,
      );
    });
  });

  describe("commands", () => {
    it("should register commands on initialization", () => {
      BotInstance.getInstance();
      expect(BotInstance.commandHandler).toBeDefined();
    });

    it("should register start command by default", () => {
      BotInstance.getInstance();
      const commands = BotInstance.commandHandler.getCommands();
      expect(commands.some((cmd) => cmd.name === "/start")).toBeTruthy();
    });
  });
});
