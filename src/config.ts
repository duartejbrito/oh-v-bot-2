import dotenv from "dotenv";
import { expand } from "dotenv-expand";

expand(dotenv.config());

const {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  OWNER_GUILD_ID,
  OWNER_ID,
  OWNER_CHANNEL_ID,
  PG_CONNECTION_STRING,
  PG_LOGGING,
} = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  throw new Error("Missing environment variables");
}

export const config = {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  OWNER_GUILD_ID,
  OWNER_ID,
  OWNER_CHANNEL_ID,
  PG_CONNECTION_STRING,
  PG_LOGGING: PG_LOGGING ? PG_LOGGING === "true" : false,
};
