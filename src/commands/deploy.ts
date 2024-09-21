import {
  CommandInteraction,
  InteractionContextType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { config } from "../config";
import { deployCommands, deployGuildCommands } from "../deploy-commands";
import { logInfo } from "../utils/logger";
import { commandsData, ownerCommandsData } from ".";

export const name = "deploy";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Deploy commands")
  .setContexts([InteractionContextType.Guild])
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: CommandInteraction) {
  logInfo("Deploy command executed");
  if (interaction.user.id !== config.OWNER_ID) {
    return await interaction.reply({
      content: "You do not have permission to use this command.",
      ephemeral: true,
    });
  }

  await deployCommands();
  await deployGuildCommands();

  await interaction
    .reply({
      content: `Commands globally deployed:\n${commandsData
        .map((d) => `/${d.name}`)
        .join("\n")}\nCommands deployed for guild ${
        config.OWNER_GUILD_ID
      }\n${ownerCommandsData.map((d) => `/${d.name}`).join("\n")}`,
      ephemeral: true,
    })
    .then(() => setTimeout(() => interaction.deleteReply(), 60000));
}
