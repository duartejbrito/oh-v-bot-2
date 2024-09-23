import {
  Colors,
  CommandInteraction,
  EmbedBuilder,
  InteractionContextType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { CargoChannel, CrateChannel } from "../db/models";
import { changeLanguage, t, TranslationKey } from "../locales";
import { getSelectMenuOptionsByRule, utils } from "../utils";
import { logInfo } from "../utils/logger";
import { selectMenusCommands } from ".";

export const name = "info";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Get the current settings for the crate and cargo channels")
  .setContexts([InteractionContextType.Guild])
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: CommandInteraction) {
  logInfo("Info command executed");
  await interaction.deferReply({ ephemeral: true });

  const guildId = interaction.guildId!;

  const crateChannel = await CrateChannel.findOne({ where: { guildId } });
  const cargoChannel = await CargoChannel.findOne({ where: { guildId } });

  const locale = utils.discord.getPreferredLocale(interaction.channel!);
  await changeLanguage(locale);

  const crateInfo = {
    channel: interaction.client.channels.cache.get(
      crateChannel?.channelId ?? ""
    ),
    role: interaction.guild?.roles.cache.get(crateChannel?.roleId ?? ""),
    autoDelete: crateChannel?.autoDelete,
    mute: getSelectMenuOptionsByRule(selectMenusCommands.crate.name)
      .filter(([key]) => crateChannel?.mute.includes(key))
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
      .map(([_, value]) => value),
  };

  const cargoInfo = {
    channel: interaction.client.channels.cache.get(
      cargoChannel?.channelId ?? ""
    ),
    role: interaction.guild?.roles.cache.get(cargoChannel?.roleId ?? ""),
    autoDelete: cargoChannel?.autoDelete,
    mute: getSelectMenuOptionsByRule(selectMenusCommands.cargo.name)
      .filter(([key]) => cargoChannel?.mute.includes(key))
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
      .map(([_, value]) => value),
  };

  const embed = new EmbedBuilder()
    .setTitle(t(TranslationKey.info_title))
    .addFields(
      {
        name: t(TranslationKey.info_crate_title),
        value: t(TranslationKey.info_crate_value).format(
          crateInfo.channel?.toString() ?? "N/A",
          crateInfo.role?.toString() ?? "N/A",
          crateInfo.autoDelete ? "Enabled" : "Disabled" ?? "N/A",
          crateInfo.mute.join(", ") ?? "N/A"
        ),
        inline: true,
      },
      {
        name: t(TranslationKey.info_cargo_title),
        value: t(TranslationKey.info_cargo_value).format(
          cargoInfo.channel?.toString() ?? "N/A",
          cargoInfo.role?.toString() ?? "N/A",
          cargoInfo.autoDelete ? "Enabled" : "Disabled" ?? "N/A",
          cargoInfo.mute.join(", ") ?? "N/A"
        ),
        inline: true,
      }
    )
    .setColor(Colors.Green);

  await interaction.followUp({
    embeds: [embed],
  });
}
