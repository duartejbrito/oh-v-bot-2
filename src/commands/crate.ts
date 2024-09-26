import {
  ActionRowBuilder,
  CommandInteraction,
  CommandInteractionOptionResolver,
  InteractionContextType,
  MessageComponentInteraction,
  PermissionFlagsBits,
  SendableChannels,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { CrateChannel } from "../db/models/CrateChannel";
import { changeLanguage, t, TranslationKey } from "../locales";
import { getSelectMenuOptionsByRule, utils } from "../utils";
import { PermissionErrorType } from "../utils/discord";
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

    logInfo(`${name} command setup executed no permissions`, {
      GuildId: guildId,
      ChannelId: channelId,
      Error: PermissionErrorType[checkPermission.type],
    });

    return await interaction.followUp({
      content,
      ephemeral: true,
    });
  }

  const role = options.getRole("role");
  const autoDelete = options.getBoolean("auto-delete")?.valueOf();

  await CrateChannel.findOrCreate({
    where: { guildId: guildId },
    defaults: {
      guildId,
      channelId,
      roleId: role?.id,
      addedBy: interaction.user.id,
      autoDelete: autoDelete || false,
      mute: [],
    },
  }).then(async ([channel, created]) => {
    if (!created) {
      channel.channelId = channelId;
      channel.roleId = role?.id;
      channel.addedBy = interaction.user.id;
      channel.autoDelete = autoDelete || false;

      await channel.save();
    }
  });

  logInfo(`${name} command setup executed`, {
    GuildId: guildId,
    ChannelId: channelId,
    RoleId: role?.id,
    AutoDelete: autoDelete,
  });

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

  const message = await interaction.editReply({
    content: t(TranslationKey.setup_crate_success).format(
      discordChannel.toString(),
      role ? role.toString() : "None",
      autoDelete ? "Enable" : "Disable"
    ),
    components: [row],
  });

  const filter = (i: MessageComponentInteraction) =>
    i.user.id === interaction.user.id;
  const collector = message.createMessageComponentCollector({
    filter,
    time: 15000,
  });

  collector?.on("collect", async (i: StringSelectMenuInteraction) => {
    if (i.customId === `${name}-mute-hours`) {
      const mutes = i.values.map((value) => value);
      await CrateChannel.update(
        { mute: mutes },
        { where: { guildId: interaction.guildId! } }
      );
      const mutesLabels = getSelectMenuOptionsByRule(name)
        .filter(([key]) => mutes.includes(key))
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
        .map(([_, value]) => value);
      await i.update({
        content: `${message.content}\nMute hours updated to ${mutesLabels.join(
          ", "
        )}`,
        components: [],
      });
      logInfo(`${name} command mute-hours executed`, {
        GuildId: guildId,
        Mutes: mutes.join(", "),
      });
    }
  });

  collector?.on("end", async (collected) => {
    if (collected.size === 0) {
      await interaction.editReply({
        content: `${message.content}\nMute hours not updated.`,
        components: [],
      });
      logInfo(`${name} command mute-hours executed and canceled`, {
        GuildId: guildId,
      });
    }
  });
}

export async function execute(interaction: CommandInteraction) {
  const options = interaction.options as CommandInteractionOptionResolver;

  if (options.getSubcommand() === "setup") {
    await setupCrateChannel(interaction);
  }
}
