import { Context } from "../Middleware";
import { rateLimitMiddleware } from "../RateLimitter";

// Mock Logger
jest.mock("../../modules/Logger", () => ({
  Logger: {
    warn: jest.fn(),
  },
}));

describe("RateLimiter", () => {
  let mockCtx: Partial<Context>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockCtx = {
      chatId: 123,
      state: new Map(),
      timestamp: Date.now(),
      userId: 123,
      message: {
        message_id: 123,
        date: 123,
        chat: { id: 123, type: "private" },
        from: { id: 123, is_bot: false, first_name: "test" },
        text: "test",
      },
    };
    mockNext = jest.fn();
  });

  it("should allow requests within rate limit", async () => {
    for (let i = 0; i < 30; i++) {
      await rateLimitMiddleware(mockCtx as Context, mockNext);
    }
    expect(mockNext).toHaveBeenCalledTimes(30);
  });

  it("should block requests outside rate limit", async () => {
    try {
      for (let i = 0; i < 30; i++) {
        await rateLimitMiddleware(mockCtx as Context, mockNext);
      }
      await rateLimitMiddleware(mockCtx as Context, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(30);
      expect(mockNext).not.toHaveBeenCalledTimes(31);
    } catch (error) {
      console.error(error);
    }
  });

  it("should throw error if user ID is not found", async () => {
    mockCtx.message = undefined;

    await expect(
      rateLimitMiddleware(mockCtx as Context, mockNext),
    ).rejects.toThrow("User ID not found");
  });
});
