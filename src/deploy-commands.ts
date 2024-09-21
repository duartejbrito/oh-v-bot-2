import { green } from "colors/safe";
import { REST, Routes } from "discord.js";
import { commandsData, ownerCommandsData } from "./commands";
import { config } from "./config";
import { logError, logInfo } from "./utils/logger";

const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

export async function deployCommands() {
  try {
    logInfo("Started refreshing application (/) commands.");

    logInfo("Globally deploying commands.");
    await rest.put(Routes.applicationCommands(config.DISCORD_CLIENT_ID), {
      body: commandsData,
    });

    logInfo(
      `Deployed commands: ${commandsData.map((d) => `/${d.name}`).join(", ")}`
    );

    logInfo("Successfully reloaded application (/) commands.");
  } catch (error) {
    logError(error as Error);
  }
}

export async function deployGuildCommands() {
  try {
    logInfo("Started refreshing application (/) commands.");

    logInfo(`Deploying commands to guild ${green(config.OWNER_GUILD_ID!)}`);
    await rest.put(
      Routes.applicationGuildCommands(
        config.DISCORD_CLIENT_ID,
        config.OWNER_GUILD_ID!
      ),
      {
        body: ownerCommandsData,
      }
    );

    logInfo(
      `Deployed commands: ${ownerCommandsData
        .map((d) => `/${d.name}`)
        .join(", ")}`
    );

    logInfo("Successfully reloaded application (/) commands.");
  } catch (error) {
    logError(error as Error);
  }
}
