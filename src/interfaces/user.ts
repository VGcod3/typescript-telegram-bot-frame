import { JsonValue } from "@prisma/client/runtime/library";

export type User = {
  id: string;
  userId: number;
  data: JsonValue;
  currentScene: string;
  createdAt: Date;
  updatedAt: Date;
};
