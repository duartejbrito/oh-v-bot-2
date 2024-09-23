import { yellow } from "colors/safe";
import { Client, time, TimestampStyles } from "discord.js";
import { Schedule } from "./schedule";
import { CrateChannel } from "../db/models/CrateChannel";
import { changeLanguage, t, TranslationKey } from "../locales";
import { utils } from "../utils";
import { PermissionError, PermissionErrorType } from "../utils/discord";
import { logError, logInfo } from "../utils/logger";

export class Test extends Schedule {
  static rule = ["* * * * *"];
  static deltaMinutes = 0;
  static override callback = async (client: Client, fireDate: Date) => {
    logInfo(
      `Job ${yellow(Test.name)} executed at ${yellow(fireDate.toISOString())}`
    );
    fireDate.setMinutes(0, 0, 0);
    const channels = await CrateChannel.findAll();
    channels.forEach(async (channel) => {
      const discordChannel = client.channels.cache.get(channel.channelId);
      const locale = utils.discord.getPreferredLocale(discordChannel);
      await changeLanguage(locale);
      const result = utils.discord.sendScheduledEmbed(
        t(TranslationKey.crate_title),
        t(TranslationKey.crate_message).format(
          time(fireDate, TimestampStyles.ShortTime)
        ),
        t(TranslationKey.crate_footer),
        discordChannel,
        channel.roleId,
        channel.autoDelete ? 30000 : 0
      );

      if (result instanceof PermissionError) {
        logError(PermissionErrorType[result.type]);
        CrateChannel.destroy({ where: { channelId: channel.channelId } });
        logInfo(`Channel ${yellow(channel.channelId)} removed from database.`);
      }
    });
  };
}
