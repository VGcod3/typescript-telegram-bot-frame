import dayjs from "dayjs";
import winston from "winston";

export class Logger {
  private static readonly COLORS = {
    error: "\x1b[31m", // Red
    info: "\x1b[36m", // Cyan
    warn: "\x1b[33m", // Yellow
    debug: "\x1b[35m", // Magenta
    log: "\x1b[32m", // Green
    reset: "\x1b[0m", // Reset
  };

  private static logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp({
        format: () => dayjs().format("YYYY-MM-DD HH:mm:ss"),
      }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ),
    defaultMeta: { service: "pokemon-bot" },
    transports: [], // Start with empty transports array
  });

  static {
    const env = process.env.NODE_ENV;

    if (env === "production") {
      // Production: Log to files
      Logger.logger.add(
        new winston.transports.File({
          filename: "logs/error.log",
          level: "error",
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      );
      Logger.logger.add(
        new winston.transports.File({
          filename: "logs/combined.log",
          maxsize: 5242880,
          maxFiles: 5,
        }),
      );
    } else if (env === "development") {
      // Development: Only console logging
      Logger.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.printf(
              ({ level, message, timestamp, context, stack }) => {
                const baseMessage = `${timestamp} [${level}]${
                  context ? ` [${context}]` : ""
                }: ${message}`;
                return stack ? `${baseMessage}\n${stack}` : baseMessage;
              },
            ),
          ),
        }),
      );
    }
    // Test environment: No logging
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static formatMessage(message: string, context?: string): any {
    return {
      message,
      context,
      timestamp: this.timestamp(),
    };
  }

  private static timestamp(): string {
    return dayjs().format("YYYY-MM-DD HH:mm:ss");
  }

  static error(error: Error | string, context?: string) {
    const message = error instanceof Error ? error.message : error;
    const meta = this.formatMessage(message, context);
    if (error instanceof Error) {
      meta.stack = error.stack;
    }
    this.logger.error(meta);
  }

  static info(message: string, context?: string) {
    this.logger.info(this.formatMessage(message, context));
  }

  static warn(message: string, context?: string) {
    this.logger.warn(this.formatMessage(message, context));
  }

  static debug(message: string, context?: string) {
    this.logger.debug(this.formatMessage(message, context));
  }

  static log(message: string, context?: string) {
    this.logger.info(this.formatMessage(message, context));
  }
}
