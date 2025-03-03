import { MessageType } from "../modules/Sender";

export interface Command {
  name: string;
  description: string;
  execute: (message: MessageType) => Promise<void>;
}
