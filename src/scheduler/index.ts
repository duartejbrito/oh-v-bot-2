import { parseExpression } from "cron-parser";
import { time, TimestampStyles } from "discord.js";
import * as schedule from "node-schedule";
import { Cargo } from "./cargo";
import { Crate } from "./crate";
import { Medic } from "./medic";
import { Test } from "./test";
import { logError, logInfo } from "../utils/logger";

export const jobs = new Map<string, schedule.Job | schedule.Job[]>();
export const rulesOptions = new Map<string, Map<string, string>>();

function extractCronOptions(jobName: string, rule: string, deltaMinutes = 0) {
  if (!rulesOptions.has(jobName)) {
    rulesOptions.set(jobName, new Map<string, string>());
  }

  const ruleOptions = rulesOptions.get(jobName)!;

  const expression = parseExpression(rule, { utc: true, iterator: true });
  expression.iterate(20, (date) => {
    const key = `${date.value
      .getUTCHours()
      .toString()
      .padStart(2, "0")}:${date.value
      .getUTCMinutes()
      .toString()
      .padStart(2, "0")}`;

    const dateLabel = new Date(date.value.getTime() + deltaMinutes * 60000);
    const label = `${dateLabel
      .getUTCHours()
      .toString()
      .padStart(2, "0")}:${dateLabel
      .getUTCMinutes()
      .toString()
      .padStart(2, "0")}`;

    if (!ruleOptions.has(key)) {
      ruleOptions.set(key, `${label} UTC`);
    }
  });
}

export function extractRuleOptions(
  jobName: string,
  rule: string | string[],
  deltaMinutes = 0
) {
  if (rule instanceof Array) {
    rule.forEach((r) => {
      extractCronOptions(jobName, r, deltaMinutes);
    });
  }

  extractCronOptions(jobName, rule as string, deltaMinutes);
}

function scheduleJob(
  jobName: string,
  rule: string,
  callback: schedule.JobCallback,
  tz: string
) {
  try {
    const job = schedule.scheduleJob(jobName, { rule, tz }, callback);
    if (job) {
      if (jobs.has(jobName)) {
        const existingJobs = jobs.get(jobName);
        if (existingJobs instanceof Array) {
          existingJobs.push(job);
          jobs.set(jobName, existingJobs);
        } else {
          const existingJob = existingJobs as schedule.Job;
          jobs.set(jobName, [existingJob, job]);
        }
      } else {
        jobs.set(jobName, job);
      }

      logInfo("Job scheduled", {
        JobName: jobName,
        Rule: `\`${rule}\``,
        NextInvocation: time(
          job.nextInvocation(),
          TimestampStyles.RelativeTime
        ),
      });
    }
  } catch (error) {
    logError("Error while scheduling job", {
      JobName: jobName,
      Rule: `\`${rule}\``,
      Error: JSON.stringify(error),
    });
  }
}

const schedules = {
  Crate,
  Cargo,
  Medic,
  // Test,
};

const tz = "Etc/UTC";

export function scheduleJobs() {
  Object.entries(schedules).forEach(([jobName, schedule]) => {
    schedule.rule.forEach((rule: string) => {
      const loweredJobName = jobName.toLowerCase();
      scheduleJob(loweredJobName, rule, schedule.callback, tz);
      extractRuleOptions(loweredJobName, rule, schedule.deltaMinutes);
    });
  });

  return jobs;
}

//   // private rules = {
//   //   crate: "0 */4 * * *",
//   //   cargo: ["55 11,14,21 * * *", "25 18 * * *"],
//   //   purification: "0 7 * * *",
//   //   controller: "0 7 * * *",
//   //   sproutlet: "15 * * * 2,4,6",
//   //   medic: "0 0,8,16 * * *",
//   //   // test: "* * * * *",
//   // };
