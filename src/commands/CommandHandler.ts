import { Logger } from "../modules/Logger";
import { MessageType } from "../modules/Sender";
import { Command } from "./Command";

export class CommandHandler {
  private commands: Map<string, Command> = new Map();

  register(command: Command): void {
    this.commands.set(command.name, command);
    Logger.info(`Registered command: ${command.name}`);
  }

  async handle(message: MessageType): Promise<void> {
    const commandName = message.text?.split(" ")[0];

    if (!commandName) return;

    const command = this.commands.get(commandName);

    if (!command) {
      Logger.warn(`Command not found: ${commandName}`);
      return;
    }

    try {
      await command.execute(message);
    } catch (error) {
      Logger.error(`Error executing command ${commandName}:`, error as string);
    }
  }

  getCommands(): Command[] {
    return Array.from(this.commands.values());
  }
}
