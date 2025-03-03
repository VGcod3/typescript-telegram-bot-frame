import { Logger } from "../modules/Logger";
import { MiddlewareFunction } from "./Middleware";

export const loggingMiddleware: MiddlewareFunction = async (ctx, next) => {
  const startTime = Date.now();
  Logger.info(`Processing message from user ${ctx.message.from?.id}`);

  await next();

  const duration = Date.now() - startTime;
  Logger.info(`Message processed in ${duration}ms`);
};
