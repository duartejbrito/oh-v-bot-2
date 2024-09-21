import { Client, time, TimestampStyles } from "discord.js";
import { CrateChannel } from "../db/models/CrateChannel";
import { utils } from "../utils";
import { translation } from "../language";
import { PermissionError, PermissionErrorType } from "../utils/discord";
import { logError, logInfo } from "../utils/logger";
import { Schedule } from "./schedule";
import { yellow } from "colors/safe";
import { Op } from "sequelize";

export class Test extends Schedule {
  static rule = ["* * * * *"];
  static override callback = async (client: Client, fireDate: Date) => {
    logInfo(
      `Job ${yellow(Test.name)} executed at ${yellow(fireDate.toISOString())}`
    );
    fireDate.setMinutes(0, 0, 0);

    const channelsTesting = await CrateChannel.findAll({
      where: {
        [Op.not]: {
          mute: { [Op.contains]: [20] },
        },
      },
    });
    console.log(channelsTesting.length);

    const channels = await CrateChannel.findAll();
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
        channel.autoDelete ? 5000 : 0
      );

      if (result instanceof PermissionError) {
        logError(PermissionErrorType[result.type]);
        CrateChannel.destroy({ where: { channelId: channel.channelId } });
        logInfo(`Channel ${yellow(channel.channelId)} removed from database.`);
      }
    });
  };
}
