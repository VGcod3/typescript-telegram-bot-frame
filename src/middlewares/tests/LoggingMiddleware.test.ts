import { loggingMiddleware } from "../LoggingMiddleware";
import { Logger } from "../../modules/Logger";
import { Context } from "../Middleware";

jest.mock("../../modules/Logger");

describe("LoggingMiddleware", () => {
  let mockCtx: Partial<Context>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
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

  it("should log start and end of message processing", async () => {
    const infoSpy = jest.spyOn(Logger, "info");

    await loggingMiddleware(mockCtx as Context, mockNext);

    expect(infoSpy).toHaveBeenCalledTimes(2);
    expect(infoSpy).toHaveBeenNthCalledWith(
      1,
      "Processing message from user 123",
    );
    expect(infoSpy).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(/Message processed in \d+ms/),
    );
  });

  it("should call next middleware", async () => {
    await loggingMiddleware(mockCtx as Context, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it("should handle messages without user id", async () => {
    mockCtx.message = undefined;
    const infoSpy = jest.spyOn(Logger, "info");

    await loggingMiddleware(mockCtx as Context, mockNext);

    expect(infoSpy).toHaveBeenNthCalledWith(
      1,
      "Processing message from user undefined",
    );
  });
});
