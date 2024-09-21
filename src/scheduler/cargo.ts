import { yellow } from "colors";
import { Client, time, TimestampStyles } from "discord.js";
import { Op } from "sequelize";
import { Schedule } from "./schedule";
import { CargoChannel } from "../db/models/CargoChannel";
import { translation } from "../language";
import { toMilliseconds, utils } from "../utils";
import { PermissionError, PermissionErrorType } from "../utils/discord";
import { logError, logInfo, logInfoTemplate } from "../utils/logger";

export class Cargo extends Schedule {
  static rule = ["55 11,14,21 * * *", "25 18 * * *"];
  static deltaMinutes = 5;
  static override callback = async (client: Client, fireDate: Date) => {
    logInfo(
      `Job ${yellow(Cargo.name.toUpperCase())} executed at ${yellow(
        fireDate.toISOString()
      )}`
    );
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

    logInfoTemplate("Channels found: {0}", channels.length.toString());

    channels.forEach((channel) => {
      const discordChannel = client.channels.cache.get(channel.channelId);
      const locale = utils.discord.getPreferredLocale(discordChannel);
      const result = utils.discord.sendScheduledEmbed(
        translation(locale).cargo_title,
        translation(locale).cargo_message.format(
          time(fireDate, TimestampStyles.RelativeTime)
        ),
        "",
        discordChannel,
        channel.roleId,
        channel.autoDelete ? toMilliseconds(3) : 0
      );

      if (result instanceof PermissionError) {
        logError(PermissionErrorType[result.type]);
        CargoChannel.destroy({ where: { channelId: channel.channelId } });
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
