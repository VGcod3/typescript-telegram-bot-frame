import { MessageType } from "../modules/Sender";

export interface Context {
  message: MessageType;
  state: Map<string, unknown>;
  timestamp: number;
  userId?: number;
  chatId: number;
}

export type NextFunction = () => Promise<void>;

export type MiddlewareFunction = (
  ctx: Context,
  next: NextFunction,
) => Promise<void>;
