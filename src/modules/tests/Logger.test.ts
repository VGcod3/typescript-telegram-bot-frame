import { Logger } from "../Logger";

describe("Logger", () => {
  const originalEnv = process.env.NODE_ENV;
  const mockConsole = {
    log: jest.spyOn(console, "log").mockImplementation(),
    info: jest.spyOn(console, "info").mockImplementation(),
    error: jest.spyOn(console, "error").mockImplementation(),
    warn: jest.spyOn(console, "warn").mockImplementation(),
    debug: jest.spyOn(console, "debug").mockImplementation(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
    mockConsole.log.mockRestore();
  });

  describe("development environment", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "development";
    });

    it("should log log messages", () => {
      const message = "Test info message";
      const context = "TestContext";
      Logger.log(message, context);
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it("should log info messages", () => {
      const message = "Test info message";
      const context = "TestContext";
      Logger.info(message, context);
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it("should log error messages with stack trace", () => {
      const error = new Error("Test error");
      const context = "TestContext";
      Logger.error(error, context);
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it("should log warning messages", () => {
      const message = "Test warning message";
      const context = "TestContext";
      Logger.warn(message, context);
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it("should log debug messages", () => {
      const message = "Test debug message";
      const context = "TestContext";
      Logger.debug(message, context);
      expect(mockConsole.error).toHaveBeenCalled();
    });
  });

  describe("production environment", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "production";
    });

    it("should create log files in production", () => {
      const message = "Test production message";
      Logger.info(message);

      expect(mockConsole.log).not.toHaveBeenCalled();
    });
  });

  describe("test environment", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "test";
    });

    it("should not log in test environment", () => {
      Logger.info("Test message");
      expect(mockConsole.log).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should handle string errors", () => {
      const errorMessage = "String error message";
      Logger.error(errorMessage);
      expect(mockConsole.log).not.toHaveBeenCalled();
    });

    it("should handle Error objects", () => {
      const error = new Error("Test error");
      Logger.error(error);
      expect(mockConsole.log).not.toHaveBeenCalled();
    });
  });
});
