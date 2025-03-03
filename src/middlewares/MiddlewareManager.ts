import { Context, MiddlewareFunction } from "./Middleware";
import { Logger } from "../modules/Logger";

export class MiddlewareManager {
  private middleware: MiddlewareFunction[] = [];

  use(fn: MiddlewareFunction): void {
    this.middleware.push(fn);
    Logger.info(`Middleware registered: ${fn.name}`);
  }

  async execute(context: Context): Promise<void> {
    const dispatch = async (index: number): Promise<void> => {
      if (index >= this.middleware.length) return;

      const middleware = this.middleware[index];

      try {
        await middleware(context, () => dispatch(index + 1));
      } catch (error) {
        Logger.error(
          `Middleware error: ${middleware.name}`,
          "MiddlewareManager",
        );
        throw error;
      }
    };

    await dispatch(0);
  }

  clear(): void {
    this.middleware = [];
    Logger.warn("Middleware chain cleared");
  }

  getMiddleware(): MiddlewareFunction[] {
    return this.middleware;
  }
}
