import { AutoDeleteMessage } from "./AutoDeleteMessage";
import { CargoChannel } from "./CargoChannel";
import { CrateChannel } from "./CrateChannel";
import { MedicChannel } from "./MedicChannel";
import db from "..";

export { CrateChannel, CargoChannel, MedicChannel, AutoDeleteMessage };

export async function initModels() {
  CrateChannel.initModel(db);
  CargoChannel.initModel(db);
  MedicChannel.initModel(db);
  AutoDeleteMessage.initModel(db);

  await db.sync({
    alter: true,
  });

  return {
    CrateChannel,
    CargoChannel,
    MedicChannel,
    AutoDeleteMessage,
  };
}
