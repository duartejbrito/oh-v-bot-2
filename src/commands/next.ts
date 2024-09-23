import {
  CommandInteraction,
  InteractionContextType,
  SlashCommandBuilder,
  time,
  TimestampStyles,
} from "discord.js";
import { Job } from "node-schedule";
import { changeLanguage, t, TranslationKey } from "../locales";
import { jobs } from "../scheduler";
import { utils } from "../utils";
import { logInfo } from "../utils/logger";
import { allCommands } from ".";

export const name = "next";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(
    "Returns the current UTC time and the next cargo/crate respawn timer."
  )
  .setContexts([InteractionContextType.Guild]);

export async function execute(interaction: CommandInteraction) {
  logInfo("Next command executed");
  await interaction.deferReply({ ephemeral: true });

  const locale = utils.discord.getPreferredLocale(interaction.channel!);
  await changeLanguage(locale);

  const now = new Date();
  const crateJob = jobs.get(allCommands.crate.name) as Job;
  const nextCrate = crateJob.nextInvocation();

  const cargoJobs = jobs.get(allCommands.cargo.name) as Job[];
  const nextCargoDates = cargoJobs.map((job) => job.nextInvocation().getTime());
  const nextCargo = new Date(Math.min.apply(null, nextCargoDates));

  await interaction.followUp({
    content: t(TranslationKey.next_respawns_message).format(
      now.getUTCHours().toString().padStart(2, "0"),
      now.getUTCMinutes().toString().padStart(2, "0"),
      time(nextCrate, TimestampStyles.LongDateTime),
      time(nextCrate, TimestampStyles.RelativeTime),
      time(nextCargo, TimestampStyles.LongDateTime),
      time(nextCargo, TimestampStyles.RelativeTime)
    ),
  });
}
