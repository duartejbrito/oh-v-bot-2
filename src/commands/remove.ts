import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { logInfo } from "../utils/logger";

export const name = "remove";

export const data = new SlashCommandBuilder();

export async function execute(interaction: CommandInteraction) {
  logInfo("Remove command executed");
}
