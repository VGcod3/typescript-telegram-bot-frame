import { z } from "zod";

const schema = z.object({
  TELEGRAM_BOT_TOKEN: z.string(),
  DATABASE_URL: z.string(),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof schema> {}
  }
}

export function envInit() {
  const parsed = schema.safeParse(process.env);

  if (parsed.success === false) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );

    throw new Error("Invalid environment variables");
  }
}

export function getEnv() {
  return {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    DATABASE_URL: process.env.DATABASE_URL,
  };
}

type ENV = ReturnType<typeof getEnv>;

declare global {
  var ENV: ENV;

  interface Window {
    ENV: ENV;
  }
}
