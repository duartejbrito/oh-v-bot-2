import {
  CommandInteraction,
  InteractionContextType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { CargoChannel, CrateChannel } from "../db/models";
import { translation } from "../language";
import { Cargo } from "../scheduler/cargo";
import { Crate } from "../scheduler/crate";
import { getSelectMenuOptionsByRule, utils } from "../utils";
import { logInfo } from "../utils/logger";

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

  const crateInfo = {
    channel: interaction.client.channels.cache.get(
      crateChannel?.channelId ?? ""
    ),
    role: interaction.guild?.roles.cache.get(crateChannel?.roleId ?? ""),
    autoDelete: crateChannel?.autoDelete,
    mute: getSelectMenuOptionsByRule(Crate.name)
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
    mute: getSelectMenuOptionsByRule(Cargo.name)
      .filter(([key]) => cargoChannel?.mute.includes(key))
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
      .map(([_, value]) => value),
  };

  await interaction.followUp({
    content: translation(locale).info_message.format(
      crateInfo.channel?.toString() ?? "N/A",
      crateInfo.role?.toString() ?? "N/A",
      crateInfo.autoDelete ? "Enable" : "Disabled" ?? "N/A",
      crateInfo.mute.join(", ") ?? "N/A",
      cargoInfo.channel?.toString() ?? "N/A",
      cargoInfo.role?.toString() ?? "N/A",
      cargoInfo.autoDelete ? "Enable" : "Disabled" ?? "N/A",
      cargoInfo.mute.join(", ") ?? "N/A"
    ),
  });
}
