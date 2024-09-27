import {
  Colors,
  CommandInteraction,
  EmbedBuilder,
  InteractionContextType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import * as cargo from "./cargo";
import * as crate from "./crate";
import * as medic from "./medic";
import { CargoChannel, CrateChannel, MedicChannel } from "../db/models";
import { changeLanguage, t, TranslationKey } from "../locales";
import { getSelectMenuOptionsByRule, utils } from "../utils";
import { logInfo } from "../utils/logger";

export const name = "info";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(
    "Get the current settings for the crate, cargo and medic channels"
  )
  .setContexts([InteractionContextType.Guild])
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const guildId = interaction.guildId!;

  const crateChannel = await CrateChannel.findOne({ where: { guildId } });
  const cargoChannel = await CargoChannel.findOne({ where: { guildId } });
  const medicChannel = await MedicChannel.findOne({ where: { guildId } });

  const locale = utils.discord.getPreferredLocale(interaction.channel!);
  await changeLanguage(locale);

  const crateInfo = {
    channel: interaction.client.channels.cache.get(
      crateChannel?.channelId ?? ""
    ),
    role: interaction.guild?.roles.cache.get(crateChannel?.roleId ?? ""),
    autoDelete: crateChannel?.autoDelete,
    mute: getSelectMenuOptionsByRule(crate.name)
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
    mute: getSelectMenuOptionsByRule(cargo.name)
      .filter(([key]) => cargoChannel?.mute.includes(key))
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
      .map(([_, value]) => value),
  };

  const medicInfo = {
    channel: interaction.client.channels.cache.get(
      medicChannel?.channelId ?? ""
    ),
    role: interaction.guild?.roles.cache.get(medicChannel?.roleId ?? ""),
    autoDelete: medicChannel?.autoDelete,
    mute: getSelectMenuOptionsByRule(medic.name)
      .filter(([key]) => medicChannel?.mute.includes(key))
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
      },
      {
        name: t(TranslationKey.info_medic_title),
        value: t(TranslationKey.info_medic_value).format(
          medicInfo.channel?.toString() ?? "N/A",
          medicInfo.role?.toString() ?? "N/A",
          medicInfo.autoDelete ? "Enabled" : "Disabled" ?? "N/A",
          medicInfo.mute.join(", ") ?? "N/A"
        ),
        inline: true,
      }
    )
    .setColor(Colors.Green);

  await interaction.followUp({
    embeds: [embed],
  });

  logInfo("Info command executed", { GuildId: interaction.guildId! });
}
