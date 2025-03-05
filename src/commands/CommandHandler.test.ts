import { Command } from "./Command";
import { CommandHandler } from "./CommandHandler";
import { MessageType } from "../modules/Sender";
import { Logger } from "../modules/Logger";

jest.mock("../modules/Logger");

describe("CommandHandler", () => {
  let commandHandler: CommandHandler;
  let mockCommand: Command;
  let mockMessage: MessageType;

  beforeEach(() => {
    commandHandler = new CommandHandler();
    mockCommand = {
      name: "test",
      description: "test command",
      execute: jest.fn(),
    } as Command;

    mockMessage = {
      message_id: 1,
      date: 1,
      chat: { id: 1, type: "private" },
      from: { id: 1, is_bot: false, first_name: "test" },
      text: "test",
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a command successfully", () => {
      commandHandler.register(mockCommand);
      expect(Logger.info).toHaveBeenCalledWith("Registered command: test");
      expect(commandHandler.getCommands()).toContain(mockCommand);
    });
  });

  describe("handle", () => {
    it("should handle valid command", async () => {
      commandHandler.register(mockCommand);
      await commandHandler.handle(mockMessage);
      expect(mockCommand.execute).toHaveBeenCalledWith(mockMessage);
    });

    it("should handle empty message", async () => {
      await commandHandler.handle({} as MessageType);
      expect(mockCommand.execute).not.toHaveBeenCalled();
    });

    it("should handle unknown command", async () => {
      await commandHandler.handle({ text: "unknown" } as MessageType);
      expect(Logger.warn).toHaveBeenCalledWith("Command not found: unknown");
    });

    it("should handle command execution error", async () => {
      const error = new Error("Test error");
      mockCommand.execute = jest.fn().mockRejectedValue(error);
      commandHandler.register(mockCommand);

      await commandHandler.handle(mockMessage);
      expect(Logger.error).toHaveBeenCalledWith(
        "Error executing command test: Error: Test error",
        "CommandHandler",
      );
    });
  });

  describe("getCommands", () => {
    it("should return empty array when no commands registered", () => {
      expect(commandHandler.getCommands()).toHaveLength(0);
    });

    it("should return all registered commands", () => {
      const command2 = {
        name: "test2",
        execute: jest.fn(),
        description: "test 2 description",
      } as Command;
      commandHandler.register(mockCommand);
      commandHandler.register(command2);

      const commands = commandHandler.getCommands();
      expect(commands).toHaveLength(2);
      expect(commands).toContain(mockCommand);
      expect(commands).toContain(command2);
    });
  });
});
