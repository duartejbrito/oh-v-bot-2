import { Client } from "discord.js";

export abstract class Schedule {
  static rule: string[];
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  static callback(client: Client, fireDate: Date): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
