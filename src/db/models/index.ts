import { AutoDeleteMessage } from "./AutoDeleteMessage";
import { CargoChannel } from "./CargoChannel";
import { CrateChannel } from "./CrateChannel";
import db from "..";

export { CrateChannel, CargoChannel, AutoDeleteMessage };

export async function initModels() {
  CrateChannel.initModel(db);
  CargoChannel.initModel(db);
  AutoDeleteMessage.initModel(db);

  await db.sync({
    alter: true,
  });

  return {
    CrateChannel,
    CargoChannel,
    AutoDeleteMessage,
  };
}
