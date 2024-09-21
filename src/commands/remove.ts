import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { utils } from "../utils";
import { logInfo } from "../utils/logger";

export const name = "remove";

export const data = new SlashCommandBuilder();

export async function execute(interaction: CommandInteraction) {
  logInfo("Remove command executed");
  await interaction.deferReply({ ephemeral: true });

  const locale = utils.discord.getPreferredLocale(interaction.channel!);
}
