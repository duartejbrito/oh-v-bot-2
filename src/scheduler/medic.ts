import { time, TimestampStyles } from "discord.js";
import { Op } from "sequelize";
import { Schedule } from "./schedule";
import { client } from "..";
import { MedicChannel } from "../db/models/MedicChannel";
import { changeLanguage, t, TranslationKey } from "../locales";
import { toMilliseconds, utils } from "../utils";
import { PermissionError, PermissionErrorType } from "../utils/discord";
import { logError, logInfo } from "../utils/logger";

export class Medic extends Schedule {
  static rule = ["0 0,8,16 * * *"];
  static deltaMinutes = 0;
  static override callback = async (fireDate: Date) => {
    fireDate.setMinutes(0, 0, 0);

    const channels = await MedicChannel.findAll({
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

    logInfo(`${Medic.name} job executing...`, {
      FireDate: time(fireDate, TimestampStyles.ShortDateTime),
      Channels: channels.length.toString(),
    });

    channels.forEach(async (channel) => {
      const discordChannel = client.channels.cache.get(channel.channelId);
      const locale = utils.discord.getPreferredLocale(discordChannel);
      await changeLanguage(locale);
      const result = await utils.discord.sendScheduledEmbed(
        t(TranslationKey.medic_title),
        t(TranslationKey.medic_message).format(
          time(fireDate, TimestampStyles.ShortTime)
        ),
        t(TranslationKey.medic_footer),
        discordChannel,
        channel.roleId,
        channel.autoDelete ? toMilliseconds(8) : 0
      );

      if (result instanceof PermissionError) {
        logError(PermissionErrorType[result.type], {
          JobName: Medic.name,
          ChannelId: channel.channelId,
        });
        await MedicChannel.destroy({ where: { channelId: channel.channelId } });
        logInfo("Channel removed from database.", {
          JobName: Medic.name,
          Error: PermissionErrorType[result.type],
          ChannelId: channel.channelId,
        });
      } else {
        logInfo("Message sent.", {
          JobName: Medic.name,
          ChannelId: channel.channelId,
          Role: channel.roleId?.toString() || "none",
          AutoDelete: `\`${channel.autoDelete}\``,
        });
      }
    });
  };
}
