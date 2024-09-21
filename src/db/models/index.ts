import type { Sequelize } from "sequelize";
import { CrateChannel } from "./CrateChannel";
import { CargoChannel } from "./CargoChannel";

export { CrateChannel, CargoChannel };

export function initModels(sequelize: Sequelize) {
  CrateChannel.initModel(sequelize);
  CargoChannel.initModel(sequelize);

  sequelize.sync({
    alter: true,
    logging: false,
  });

  return {
    CrateChannel,
    CargoChannel,
  };
}
