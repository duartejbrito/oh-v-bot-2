import {
  Channel,
  Client,
  ColorResolvable,
  Colors,
  CommandInteraction,
  CommandInteractionOptionResolver,
  EmbedBuilder,
  GuildChannel,
  Locale,
  PermissionFlagsBits,
  SendableChannels,
} from "discord.js";
import { logError, logInfo } from "./logger";
import { AutoDeleteMessage } from "../db/models/AutoDeleteMessage";

export enum PermissionErrorType {
  /* eslint-disable no-unused-vars */
  NO_FOUND_CHANNEL,
  NO_SENDABLE_CHANNEL,
  NO_SEND_CHANNEL,
  NO_VIEW_CHANNEL,
  NO_EMBED,
  /* eslint-enable no-unused-vars */
}

const permissionErroMessage = {
  [PermissionErrorType.NO_FOUND_CHANNEL]: "Not found channel",
  [PermissionErrorType.NO_SENDABLE_CHANNEL]: "Not sendable channel",
  [PermissionErrorType.NO_SEND_CHANNEL]: "No send permission",
  [PermissionErrorType.NO_VIEW_CHANNEL]: "No view permission",
  [PermissionErrorType.NO_EMBED]: "No embed permission",
};

export class PermissionError extends Error {
  public type: PermissionErrorType;

  constructor(type: PermissionErrorType) {
    super();
    this.type = type;
    this.message = permissionErroMessage[type];
  }
}

export const getPreferredLocale = (channel: Channel | undefined): Locale => {
  const locale = (channel as GuildChannel)?.guild.preferredLocale;
  return locale || Locale.EnglishUS;
};

export function checkPermissions(channel?: Channel) {
  if (!channel)
    return new PermissionError(PermissionErrorType.NO_FOUND_CHANNEL);

  if (!channel.isSendable())
    return new PermissionError(PermissionErrorType.NO_SENDABLE_CHANNEL);

  const guildChannel = channel as GuildChannel;
  if (
    !guildChannel
      .permissionsFor(guildChannel.guild.members.me!)
      .has(PermissionFlagsBits.SendMessages)
  )
    return new PermissionError(PermissionErrorType.NO_SEND_CHANNEL);

  if (
    !guildChannel
      .permissionsFor(guildChannel.guild.members.me!)
      .has(PermissionFlagsBits.ViewChannel)
  )
    return new PermissionError(PermissionErrorType.NO_VIEW_CHANNEL);

  if (
    !guildChannel
      .permissionsFor(guildChannel.guild.members.me!)
      .has(PermissionFlagsBits.EmbedLinks)
  )
    return new PermissionError(PermissionErrorType.NO_EMBED);
}

export function sendScheduledEmbed(
  title: string,
  description: string,
  footer: string,
  channel?: Channel,
  roleId?: string,
  autoDelete?: number,
  color: ColorResolvable = Colors.Blurple
) {
  const permissionCheck = checkPermissions(channel);
  if (permissionCheck) return permissionCheck;

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .addFields([{ name: " ", value: description, inline: false }])
    .setFooter({ text: footer });

  const content = roleId ? `<@&${roleId}>` : undefined;

  const message = (channel as SendableChannels).send({
    embeds: [embed],
    content,
  });

  if (autoDelete && autoDelete > 0) {
    return message.then(async (message) => {
      await AutoDeleteMessage.create({
        guildId: (channel as GuildChannel).guild.id,
        channelId: channel!.id,
        messageId: message.id,
        timeout: autoDelete,
      });
      setTimeout(async () => {
        message.delete();
        await AutoDeleteMessage.destroy({ where: { messageId: message.id } });
      }, autoDelete);
    });
  }
  return message;
}

export function mentionCommand(interaction: CommandInteraction) {
  const options = interaction.options as CommandInteractionOptionResolver;

  const subcommandgroup = options.getSubcommandGroup();
  const subcommand = options.getSubcommand();

  if (subcommandgroup) {
    return `</${interaction.commandName} ${subcommandgroup} ${subcommand}:${interaction.commandId}>`;
  }

  if (subcommand) {
    return `</${interaction.commandName} ${subcommand}:${interaction.commandId}>`;
  }

  return `</${interaction.commandName}:${interaction.commandId}>`;
}

export async function handleDanglingMessages(client: Client) {
  const autoDeleteMessages = await AutoDeleteMessage.findAll();

  const currentTime = new Date();

  const toDelete = autoDeleteMessages.filter(
    (msg) => currentTime.getTime() > msg.createdAt.getTime() + msg.timeout
  );
  const deletes = toDelete.map(async (msg) => {
    try {
      await (
        client.guilds.cache
          .get(msg.guildId)
          ?.channels.cache.get(msg.channelId) as SendableChannels
      )?.messages.delete(msg.messageId);
    } catch (error) {
      logError(error as Error);
    }
  });
  await Promise.all(deletes);
  await AutoDeleteMessage.destroy({
    where: { messageId: toDelete.map((msg) => msg.messageId) },
  });

  const toHandle = autoDeleteMessages.filter(
    (msg) => !(currentTime.getTime() > msg.createdAt.getTime() + msg.timeout)
  );
  toHandle.forEach(async (msg) => {
    setTimeout(async () => {
      await (
        client.guilds.cache
          .get(msg.guildId)
          ?.channels.cache.get(msg.channelId) as SendableChannels
      )?.messages.delete(msg.messageId);
      await AutoDeleteMessage.destroy({
        where: { messageId: msg.messageId },
      });
    }, msg.createdAt.getTime() + msg.timeout - currentTime.getTime());
  });

  logInfo("Dangling messages handled", {
    Deleted: toDelete.length,
    WillDelete: toHandle.length,
  });
}
