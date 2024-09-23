import {
  ActionRowBuilder,
  AnySelectMenuInteraction,
  CommandInteraction,
  CommandInteractionOptionResolver,
  InteractionContextType,
  PermissionFlagsBits,
  SendableChannels,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { CargoChannel } from "../db/models/CargoChannel";
import { changeLanguage, t, TranslationKey } from "../locales";
import {
  getSelectMenuCommandName,
  getSelectMenuOptionsByRule,
  utils,
} from "../utils";
import { logInfo } from "../utils/logger";

export const name = "cargo";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Commands related to cargo")
  .setContexts([InteractionContextType.Guild])
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand((subcommand) =>
    subcommand
      .setName("setup")
      .setDescription("Setup for Cargo Scramble alerts.")
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription(
            "The text/announcement channel you want notifications in."
          )
          .setRequired(true)
      )
      .addRoleOption((option) =>
        option
          .setName("role")
          .setDescription("The role you want mentioned in the alert.")
          .setRequired(false)
      )
      .addBooleanOption((option) =>
        option
          .setName("auto-delete")
          .setDescription(
            "Toggle Cargo Scramble alerts to auto delete before the next post."
          )
          .setRequired(false)
      )
  );

async function setupCargoChannel(interaction: CommandInteraction) {
  logInfo("Cargo command setup executed");
  await interaction.deferReply({ ephemeral: true });

  const options = interaction.options as CommandInteractionOptionResolver;

  const guildId = interaction.guildId!;
  const channelId = options.getChannel("channel")!.id;
  const discordChannel = interaction.client.channels.cache.get(channelId)!;

  const checkPermission = utils.discord.checkPermissions(discordChannel);

  const locale = utils.discord.getPreferredLocale(discordChannel);
  await changeLanguage(locale);

  if (checkPermission) {
    const content =
      checkPermission.type ===
      utils.discord.PermissionErrorType.NO_SENDABLE_CHANNEL
        ? t(TranslationKey.check_channel_type_error).format(
            utils.discord.mentionCommand(interaction)
          )
        : t(TranslationKey.cargo_channel_alert_error).format(
            discordChannel.toString()
          );

    return await interaction.followUp({
      content,
      ephemeral: true,
    });
  }

  const role = options.getRole("role");
  const autoDelete = options.getBoolean("auto-delete")?.valueOf();

  await CargoChannel.destroy({ where: { guildId: guildId } });
  await CargoChannel.create({
    guildId,
    channelId,
    roleId: role?.id,
    addedBy: interaction.user.id,
    autoDelete: autoDelete || false,
  } as CargoChannel);

  await (discordChannel as SendableChannels).send({
    content: t(TranslationKey.setup_cargo_channel_ping).format(
      discordChannel.toString()
    ),
  });

  const selectMenuOptions = getSelectMenuOptionsByRule(name).map(
    ([key, value]) =>
      new StringSelectMenuOptionBuilder().setLabel(value).setValue(key)
  );

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`${name}-mute-hours`)
    .setPlaceholder("Pick the hour(s) you want to mute.")
    .setMinValues(0)
    .setMaxValues(selectMenuOptions.length - 1)
    .addOptions(...selectMenuOptions);

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    selectMenu
  );

  await interaction.followUp({
    content: t(TranslationKey.setup_cargo_success).format(
      discordChannel.toString(),
      role ? role.toString() : "None",
      autoDelete ? "Enable" : "Disable"
    ),
    ephemeral: true,
    components: [row],
  });
}

export async function execute(interaction: CommandInteraction) {
  logInfo("Cargo command executed");
  const options = interaction.options as CommandInteractionOptionResolver;

  if (options.getSubcommand() === "setup") {
    await setupCargoChannel(interaction);
  }
}

export async function executeSelectMenu(interaction: AnySelectMenuInteraction) {
  logInfo("Cargo command select menu executed");
  const selectMenuCommandName = getSelectMenuCommandName(interaction.customId);

  if (selectMenuCommandName === "mute-hours") {
    logInfo("Cargo command mute-hours executed");
    const mutes = interaction.values.map((value) => value);
    await CargoChannel.update(
      { mute: mutes },
      { where: { guildId: interaction.guildId! } }
    );

    const mutesLabels = getSelectMenuOptionsByRule(name)
      .filter(([key]) => mutes.includes(key))
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
      .map(([_, value]) => value);

    await interaction.update({
      content: `${
        interaction.message.content
      }\nMute hours updated to ${mutesLabels.join(", ")}`,
      components: [],
    });
  }
}
