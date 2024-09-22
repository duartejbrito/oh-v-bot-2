import {
  CommandInteraction,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageComponentInteraction,
  InteractionContextType,
  PermissionFlagsBits,
} from "discord.js";
import { utils } from "../utils";
import { logInfo } from "../utils/logger";

export const name = "remove";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Remove all your data")
  .setContexts([InteractionContextType.Guild])
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: CommandInteraction) {
  logInfo("Remove command executed");
  await interaction.deferReply({ ephemeral: true });

  const locale = utils.discord.getPreferredLocale(interaction.channel!);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("remove")
      .setLabel("Remove")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("cancel")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Secondary)
  );

  const message = await interaction.editReply({
    content: "Are you sure you want to delete all your data?",
    components: [row],
  });

  const filter = (i: MessageComponentInteraction) =>
    i.user.id === interaction.user.id;
  const collector = message.createMessageComponentCollector({
    filter,
    time: 15000,
  });

  collector?.on("collect", async (i: MessageComponentInteraction) => {
    if (i.customId === "remove") {
      await i.update({ content: "Data removed!", components: [] });
      // Place the code to remove the data here
    } else if (i.customId === "cancel") {
      await i.update({ content: "Data removal canceled.", components: [] });
    }
  });

  collector?.on("end", async (collected) => {
    if (collected.size === 0) {
      await interaction.editReply({
        content: "No response, data removal canceled.",
        components: [],
      });
    }
  });
}
