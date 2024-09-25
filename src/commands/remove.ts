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
import { AutoDeleteMessage, CargoChannel, CrateChannel } from "../db/models";
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
      const deletedCargos = await CargoChannel.destroy({
        where: { guildId: i.guildId! },
      });
      const deletedCrates = await CrateChannel.destroy({
        where: { guildId: i.guildId! },
      });
      const deletedAutoDelete = await AutoDeleteMessage.destroy({
        where: { guildId: i.guildId! },
      });
      await i.update({
        content: `Data removed!\nCrate Setup: ${deletedCrates}\nCargo Setup: ${deletedCargos}\nAuto delete messages: ${deletedAutoDelete}`,
        components: [],
      });
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
