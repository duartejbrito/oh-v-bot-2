import type { Sequelize } from "sequelize";
import { CargoChannel } from "./CargoChannel";
import { CrateChannel } from "./CrateChannel";

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
