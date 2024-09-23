import { yellow } from "colors";
import { Client, time, TimestampStyles } from "discord.js";
import { Op } from "sequelize";
import { Schedule } from "./schedule";
import { CrateChannel } from "../db/models/CrateChannel";
import { changeLanguage, t, TranslationKey } from "../locales";
import { toMilliseconds, utils } from "../utils";
import { PermissionError, PermissionErrorType } from "../utils/discord";
import { logError, logInfo, logInfoTemplate } from "../utils/logger";

export class Crate extends Schedule {
  static rule = ["0 */4 * * *"];
  static deltaMinutes = 0;
  static override callback = async (client: Client, fireDate: Date) => {
    logInfo(
      `Job ${yellow(Crate.name.toUpperCase())} executed at ${yellow(
        fireDate.toISOString()
      )}`
    );
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

    logInfoTemplate("Channels found: {0}", channels.length.toString());

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
        logError(PermissionErrorType[result.type]);
        CrateChannel.destroy({ where: { channelId: channel.channelId } });
        logInfo(`Channel ${yellow(channel.channelId)} removed from database.`);
      } else {
        logInfo(
          `Message sent to channel ${yellow(
            channel.channelId
          )} with role ${yellow(channel.roleId?.toString() || "none")}`
        );
      }
    });
  };
}
