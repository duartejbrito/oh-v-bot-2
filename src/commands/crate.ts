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
import { CrateChannel } from "../db/models/CrateChannel";
import { changeLanguage, t, TranslationKey } from "../locales";
import {
  getSelectMenuCommandName,
  getSelectMenuOptionsByRule,
  utils,
} from "../utils";
import { logInfo } from "../utils/logger";

export const name = "crate";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Commands related to crates")
  .setContexts([InteractionContextType.Guild])
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand((subcommand) =>
    subcommand
      .setName("setup")
      .setDescription("Setup for Weapon/Gear Crate respawn alerts.")
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
            "Toggle Weapon/Gear Crate alerts to auto delete before the next post."
          )
          .setRequired(false)
      )
  );

async function setupCrateChannel(interaction: CommandInteraction) {
  logInfo("Crate command setup executed");
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
        : t(TranslationKey.crate_channel_alert_error).format(
            discordChannel.toString()
          );

    return await interaction.followUp({
      content,
      ephemeral: true,
    });
  }

  const role = options.getRole("role");
  const autoDelete = options.getBoolean("auto-delete")?.valueOf();

  await CrateChannel.destroy({ where: { guildId: guildId } });
  await CrateChannel.create({
    guildId,
    channelId,
    roleId: role?.id,
    addedBy: interaction.user.id,
    autoDelete: autoDelete || false,
  } as CrateChannel);

  await (discordChannel as SendableChannels).send({
    content: t(TranslationKey.setup_crate_channel_ping).format(
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
    content: t(TranslationKey.setup_crate_success).format(
      discordChannel.toString(),
      role ? role.toString() : "None",
      autoDelete ? "Enable" : "Disable"
    ),
    ephemeral: true,
    components: [row],
  });
}

export async function execute(interaction: CommandInteraction) {
  logInfo("Crate command executed");
  const options = interaction.options as CommandInteractionOptionResolver;

  if (options.getSubcommand() === "setup") {
    await setupCrateChannel(interaction);
  }
}

export async function executeSelectMenu(interaction: AnySelectMenuInteraction) {
  logInfo("Crate command select menu executed");
  const selectMenuCommandName = getSelectMenuCommandName(interaction.customId);

  if (selectMenuCommandName === "mute-hours") {
    logInfo("Crate command mute-hours executed");
    const mutes = interaction.values.map((value) => value);
    await CrateChannel.update(
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
