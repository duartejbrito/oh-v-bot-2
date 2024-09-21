import { Sequelize, Options } from "sequelize";
import { config } from "../config";

const db: Sequelize = new Sequelize(config.PG_CONNECTION_STRING!, {
  dialect: "postgres",
  logging: false,
} as Options);

export default db;
