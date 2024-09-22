import { yellow } from "colors/safe";
import { Options, Sequelize } from "sequelize";
import { config } from "../config";
import { logInfoTemplate } from "../utils/logger";

const db: Sequelize = new Sequelize(config.PG_CONNECTION_STRING!, {
  dialect: "postgres",
  benchmark: true,
  logging: config.PG_LOGGING
    ? (sql, timing) => {
        logInfoTemplate(
          `${yellow("[TIMING]:")} {1}ms ${yellow("[SQL]:")} {0}`,
          sql,
          timing?.toString() || ""
        );
      }
    : false,
} as Options);

export default db;
