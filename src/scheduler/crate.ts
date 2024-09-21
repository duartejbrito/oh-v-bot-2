import { Client, time, TimestampStyles } from "discord.js";
import { CrateChannel } from "../db/models/CrateChannel";
import { Schedule } from "./schedule";
import { translation } from "../language";
import { toMilliseconds, utils } from "../utils";
import { PermissionError, PermissionErrorType } from "../utils/discord";
import { logError, logInfo } from "../utils/logger";
import { yellow } from "colors";
import { Op } from "sequelize";

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
    channels.forEach((channel) => {
      const discordChannel = client.channels.cache.get(channel.channelId);
      const locale = utils.discord.getPreferredLocale(discordChannel);
      const result = utils.discord.sendScheduledEmbed(
        translation(locale).crate_title,
        translation(locale).crate_message.format(
          time(fireDate, TimestampStyles.ShortTime)
        ),
        translation(locale).crate_footer,
        discordChannel,
        channel.roleId,
        channel.autoDelete ? toMilliseconds(4) : 0
      );

      if (result instanceof PermissionError) {
        logError(PermissionErrorType[result.type]);
        CrateChannel.destroy({ where: { channelId: channel.channelId } });
        logInfo(`Channel ${yellow(channel.channelId)} removed from database.`);
      }
    });
  };
}
