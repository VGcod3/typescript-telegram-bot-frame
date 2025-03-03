import dayjs from "dayjs";

export class Logger {
  private static readonly COLORS = {
    error: "\x1b[31m", // Red
    info: "\x1b[36m", // Cyan
    warn: "\x1b[33m", // Yellow
    debug: "\x1b[35m", // Magenta
    log: "\x1b[32m", // Green
    reset: "\x1b[0m", // Reset
  };

  private static timestamp(): string {
    return dayjs().format("YYYY-MM-DD HH:mm:ss");
  }

  private static format(
    level: string,
    message: string,
    context?: string,
  ): string {
    return `${
      this.COLORS[level as keyof typeof this.COLORS]
    }[${level.toUpperCase()}] ${this.timestamp()}${
      context ? ` [${context}]` : ""
    } ${message}${this.COLORS.reset}`;
  }

  static error(error: Error | string, context?: string) {
    const message = error instanceof Error ? error.message : error;
    console.error(this.format("error", message, context));
  }

  static info(message: string, context?: string) {
    console.info(this.format("info", message, context));
  }

  static warn(message: string, context?: string) {
    console.warn(this.format("warn", message, context));
  }

  static debug(message: string, context?: string) {
    console.debug(this.format("debug", message, context));
  }

  static log(message: string, context?: string) {
    console.log(this.format("log", message, context));
  }
}
