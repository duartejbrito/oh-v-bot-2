import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { logInfo } from "../utils/logger";
import { utils } from "../utils";

export const name = "info";

export const data = new SlashCommandBuilder();

export async function execute(interaction: CommandInteraction) {
  logInfo("Info command executed");
  await interaction.deferReply({ ephemeral: true });

  const locale = utils.discord.getPreferredLocale(interaction.channel!);
}
