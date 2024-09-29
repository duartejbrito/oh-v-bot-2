import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  InteractionContextType,
  MessageComponentInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { logInfo } from "../utils/logger";

export const name = "color";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription(
    "Receives a text input and returns the same text wrapped in a selected color."
  )
  .addStringOption((option) =>
    option
      .setName("text")
      .setDescription("The text to colorize.")
      .setRequired(true)
  )
  .setContexts([InteractionContextType.Guild]);

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const colorOptions = [
    { name: "Red", hex: "#FF0000", emoji: "🟥" },
    { name: "Blue", hex: "#0000FF", emoji: "🟦" },
    { name: "Green", hex: "#00FF00", emoji: "🟩" },
    { name: "Yellow", hex: "#FFFF00", emoji: "🟨" },
    { name: "Purple", hex: "#800080", emoji: "🟪" },
  ];

  const colorButtons = colorOptions.map((color) =>
    new ButtonBuilder()
      .setCustomId(`color_${color.name.toLowerCase()}`)
      .setLabel(color.name)
      .setEmoji({ name: color.emoji })
      .setStyle(ButtonStyle.Secondary)
  );

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    ...colorButtons
  );

  const message = await interaction.editReply({
    content: "Select a color to wrap the text:",
    components: [row],
  });

  const filter = (i: MessageComponentInteraction) =>
    i.user.id === interaction.user.id;
  const collector = message.createMessageComponentCollector({
    filter,
    time: 15000,
  });

  collector?.on("collect", async (i: MessageComponentInteraction) => {
    const color = i.customId.split("_")[1];
    const text = interaction.options.get("text")!.value! as string;

    const selected = colorOptions.filter(
      (c) => c.name.toLowerCase() === color
    )[0];

    await i.update({
      content: `**#c${selected.hex.split("#")[1]}${text}**`,
      components: [],
    });

    logInfo("Color command executed.", {
      GuildId: interaction.guildId!,
      UserId: interaction.user.id,
      Color: color,
      Text: text,
    });
  });

  collector?.on("end", async (collected) => {
    if (collected.size === 0) {
      await interaction.editReply({
        content: "No response, color command canceled.",
        components: [],
      });
      logInfo("Color command canceled.", { GuildId: interaction.guildId! });
    }
  });
}
