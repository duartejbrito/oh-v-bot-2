import {
  CommandInteraction,
  InteractionContextType,
  SlashCommandBuilder,
  time,
  TimestampStyles,
} from "discord.js";
import { utils } from "../utils";
import { jobs } from "../scheduler";
import { Crate } from "../scheduler/crate";
import { Job } from "node-schedule";
import { translation } from "../language";
import { Cargo } from "../scheduler/cargo";
import { logInfo } from "../utils/logger";

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

  const now = new Date();
  const crateJob = jobs.get(Crate.name) as Job;
  const nextCrate = crateJob.nextInvocation();

  const cargoJobs = jobs.get(Cargo.name) as Job[];
  const nextCargoDates = cargoJobs.map((job) => job.nextInvocation().getTime());
  const nextCargo = new Date(Math.min.apply(null, nextCargoDates));

  await interaction.followUp({
    content: translation(locale).next_respawns_message.format(
      now.getUTCHours().toString().padStart(2, "0"),
      now.getUTCMinutes().toString().padStart(2, "0"),
      time(nextCrate, TimestampStyles.LongDateTime),
      time(nextCrate, TimestampStyles.RelativeTime),
      time(nextCargo, TimestampStyles.LongDateTime),
      time(nextCargo, TimestampStyles.RelativeTime)
    ),
  });
}
