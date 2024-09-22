import type { Sequelize } from "sequelize";
import { AutoDeleteMessage } from "./AutoDeleteMessage";
import { CargoChannel } from "./CargoChannel";
import { CrateChannel } from "./CrateChannel";

export { CrateChannel, CargoChannel, AutoDeleteMessage };

export async function initModels(sequelize: Sequelize) {
  CrateChannel.initModel(sequelize);
  CargoChannel.initModel(sequelize);
  AutoDeleteMessage.initModel(sequelize);

  await sequelize.sync({
    alter: true,
  });

  return {
    CrateChannel,
    CargoChannel,
    AutoDeleteMessage,
  };
}
