import { time, TimestampStyles } from "discord.js";
import { Op } from "sequelize";
import { Schedule } from "./schedule";
import { client } from "..";
import { CargoChannel } from "../db/models/CargoChannel";
import { changeLanguage, t, TranslationKey } from "../locales";
import { toMilliseconds, utils } from "../utils";
import { PermissionError, PermissionErrorType } from "../utils/discord";
import { logError, logInfo } from "../utils/logger";

export class Cargo extends Schedule {
  static rule = ["55 11,14,21 * * *", "25 18 * * *"];
  static deltaMinutes = 5;
  static override callback = async (fireDate: Date) => {
    fireDate.setSeconds(0, 0);

    const channels = await CargoChannel.findAll({
      where: {
        [Op.not]: {
          mute: {
            [Op.contains]: [
              `${fireDate.getUTCHours()}:${fireDate.getUTCMinutes()}`,
            ],
          },
        },
      },
    });

    logInfo(`${Cargo.name} job executing...`, {
      FireDate: time(fireDate, TimestampStyles.ShortDateTime),
      Channels: channels.length.toString(),
    });

    channels.forEach(async (channel) => {
      const discordChannel = client.channels.cache.get(channel.channelId);
      const locale = utils.discord.getPreferredLocale(discordChannel);
      await changeLanguage(locale);
      const result = await utils.discord.sendScheduledEmbed(
        t(TranslationKey.cargo_title),
        t(TranslationKey.cargo_message).format(
          time(fireDate, TimestampStyles.RelativeTime)
        ),
        t(TranslationKey.cargo_footer),
        discordChannel,
        channel.roleId,
        channel.autoDelete ? toMilliseconds(3) : 0
      );

      if (result instanceof PermissionError) {
        logError(PermissionErrorType[result.type], {
          JobName: Cargo.name,
          ChannelId: channel.channelId,
        });
        await CargoChannel.destroy({ where: { channelId: channel.channelId } });
        logInfo("Channel removed from database.", {
          JobName: Cargo.name,
          Error: PermissionErrorType[result.type],
          ChannelId: channel.channelId,
        });
      } else {
        logInfo("Message sent.", {
          JobName: Cargo.name,
          ChannelId: channel.channelId,
          Role: channel.roleId?.toString() || "none",
          AutoDelete: `\`${channel.autoDelete}\``,
        });
      }
    });
  };
}
