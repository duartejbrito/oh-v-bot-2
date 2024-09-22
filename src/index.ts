import { green } from "colors/safe";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { allCommands, selectMenusCommands } from "./commands";
import { config } from "./config";
import db from "./db";
import { initModels } from "./db/models";
import { deployCommands, deployGuildCommands } from "./deploy-commands";
import { scheduleJobs } from "./scheduler";
import { logInfo, logError } from "./utils/logger";

export const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, async () => {
  logInfo(`Discord bot is ready! 🤖 ${green(client.user!.tag)}`);
  initModels(db);
  scheduleJobs(client);
});

client.on(Events.GuildCreate, async (guild) => {
  if (guild.id === config.OWNER_GUILD_ID) {
    await deployCommands();
    await deployGuildCommands();
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  const { commandName } = interaction;
  if (allCommands[commandName as keyof typeof allCommands]) {
    try {
      await allCommands[commandName as keyof typeof allCommands].execute(
        interaction
      );
    } catch (error) {
      logError(error as Error);
      const errorMessage = "There was an error while executing this command!";
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isAnySelectMenu()) {
    return;
  }

  const { customId } = interaction;
  const commandName = customId.split("-")[0];
  if (selectMenusCommands[commandName as keyof typeof selectMenusCommands]) {
    try {
      await selectMenusCommands[
        commandName as keyof typeof selectMenusCommands
      ].executeSelectMenu(interaction);
    } catch (error) {
      logError(error as Error);
      const errorMessage = "There was an error while executing this command!";
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  }
});

client.login(config.DISCORD_TOKEN);
