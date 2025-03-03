import { MiddlewareFunction } from "./Middleware";
import { Logger } from "../modules/Logger";

const RATE_LIMIT = 30; // messages
const TIME_WINDOW = 10_000; // 10 seconds

class RateLimiter {
  private requests: Map<number, number[]> = new Map();

  checkLimit(userId: number): boolean {
    const now = Date.now();
    const userTimes = this.requests.get(userId) || [];
    const recentRequests = userTimes.filter((time) => now - time < TIME_WINDOW);

    if (recentRequests.length >= RATE_LIMIT) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(userId, recentRequests);
    return true;
  }
}

const rateLimiter = new RateLimiter();

export const rateLimitMiddleware: MiddlewareFunction = async (ctx, next) => {
  const userId = ctx.message.from?.id;

  if (!userId) {
    throw new Error("User ID not found");
  }

  if (!rateLimiter.checkLimit(userId)) {
    Logger.warn(`Rate limit exceeded for user ${userId}`);
    throw new Error("Rate limit exceeded. Please try again later.");
  }

  await next();
};
