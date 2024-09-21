import {
  CommandInteraction,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";

export const name = "ping";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Replies with Pong!")
  .setContexts([InteractionContextType.Guild]);

export async function execute(interaction: CommandInteraction) {
  return interaction.reply({ content: "Pong!", ephemeral: true });
}
