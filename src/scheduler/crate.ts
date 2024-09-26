import { time, TimestampStyles } from "discord.js";
import { Op } from "sequelize";
import { Schedule } from "./schedule";
import { client } from "..";
import { CrateChannel } from "../db/models/CrateChannel";
import { changeLanguage, t, TranslationKey } from "../locales";
import { toMilliseconds, utils } from "../utils";
import { PermissionError, PermissionErrorType } from "../utils/discord";
import { logError, logInfo } from "../utils/logger";

export class Crate extends Schedule {
  static rule = ["0 */4 * * *"];
  static deltaMinutes = 0;
  static override callback = async (fireDate: Date) => {
    fireDate.setMinutes(0, 0, 0);

    const channels = await CrateChannel.findAll({
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

    logInfo(`${Crate.name} job executing...`, {
      FireDate: time(fireDate, TimestampStyles.ShortDateTime),
      Channels: channels.length.toString(),
    });

    channels.forEach(async (channel) => {
      const discordChannel = client.channels.cache.get(channel.channelId);
      const locale = utils.discord.getPreferredLocale(discordChannel);
      await changeLanguage(locale);
      const result = await utils.discord.sendScheduledEmbed(
        t(TranslationKey.crate_title),
        t(TranslationKey.crate_message).format(
          time(fireDate, TimestampStyles.ShortTime)
        ),
        t(TranslationKey.crate_footer),
        discordChannel,
        channel.roleId,
        channel.autoDelete ? toMilliseconds(4) : 0
      );

      if (result instanceof PermissionError) {
        logError(PermissionErrorType[result.type], {
          JobName: Crate.name,
          ChannelId: channel.channelId,
        });
        await CrateChannel.destroy({ where: { channelId: channel.channelId } });
        logInfo("Channel removed from database.", {
          JobName: Crate.name,
          Error: PermissionErrorType[result.type],
          ChannelId: channel.channelId,
        });
      } else {
        logInfo("Message sent.", {
          JobName: Crate.name,
          ChannelId: channel.channelId,
          Role: channel.roleId?.toString() || "none",
          AutoDelete: `\`${channel.autoDelete}\``,
        });
      }
    });
  };
}
