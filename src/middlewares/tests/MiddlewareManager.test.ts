import { MiddlewareManager } from "../MiddlewareManager";
import { Context } from "../Middleware";
import { Logger } from "../../modules/Logger";

jest.mock("../../modules/Logger");

describe("MiddlewareManager", () => {
  let manager: MiddlewareManager;
  let mockContext: Context;

  beforeEach(() => {
    manager = new MiddlewareManager();
    mockContext = {} as Context;
    jest.clearAllMocks();
  });

  describe("use", () => {
    it("should add middleware to the chain", () => {
      const middleware = jest.fn();
      manager.use(middleware);
      expect(manager.getMiddleware()).toContain(middleware);
      expect(Logger.info).toHaveBeenCalledWith(
        `Middleware registered: ${middleware.name}`,
      );
    });
  });

  describe("execute", () => {
    it("should execute middleware in order", async () => {
      const order: number[] = [];
      const middleware1 = jest.fn(async (ctx, next) => {
        order.push(1);
        await next();
      });
      const middleware2 = jest.fn(async (ctx, next) => {
        order.push(2);
        await next();
      });

      manager.use(middleware1);
      manager.use(middleware2);
      await manager.execute(mockContext);

      expect(order).toEqual([1, 2]);
      expect(middleware1).toHaveBeenCalled();
      expect(middleware2).toHaveBeenCalled();
    });

    it("should handle middleware errors", async () => {
      const error = new Error("Middleware error");
      const middleware = jest.fn().mockRejectedValue(error);

      manager.use(middleware);

      await expect(manager.execute(mockContext)).rejects.toThrow(error);
      expect(Logger.error).toHaveBeenCalledWith(
        `Middleware error: ${middleware.name}`,
        "MiddlewareManager",
      );
    });

    it("should stop execution if middleware doesn't call next", async () => {
      const middleware1 = jest.fn(async () => {});
      const middleware2 = jest.fn(async (ctx, next) => await next());

      manager.use(middleware1);
      manager.use(middleware2);
      await manager.execute(mockContext);

      expect(middleware1).toHaveBeenCalled();
      expect(middleware2).not.toHaveBeenCalled();
    });
  });

  describe("clear", () => {
    it("should remove all middleware", () => {
      const middleware = jest.fn();
      manager.use(middleware);
      manager.clear();

      expect(manager.getMiddleware()).toHaveLength(0);
      expect(Logger.warn).toHaveBeenCalledWith("Middleware chain cleared");
    });
  });

  describe("getMiddleware", () => {
    it("should return all registered middleware", () => {
      const middleware1 = jest.fn();
      const middleware2 = jest.fn();

      manager.use(middleware1);
      manager.use(middleware2);

      const result = manager.getMiddleware();
      expect(result).toHaveLength(2);
      expect(result).toContain(middleware1);
      expect(result).toContain(middleware2);
    });
  });
});
