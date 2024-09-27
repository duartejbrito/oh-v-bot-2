import * as cargo from "./cargo";
import * as crate from "./crate";
import * as deploy from "./deploy";
import * as info from "./info";
import * as medic from "./medic";
import * as next from "./next";
import * as ping from "./ping";
import * as remove from "./remove";

export const allCommands = {
  ping,
  info,
  next,
  remove,
  crate,
  cargo,
  medic,
  deploy,
};

export const commands = {
  ping,
  info,
  next,
  remove,
  crate,
  cargo,
  medic,
};

export const ownerCommands = {
  deploy,
};

export const allCommandsData = Object.values(allCommands).map(
  (command) => command.data
);

export const commandsData = Object.values(commands).map(
  (command) => command.data
);

export const ownerCommandsData = Object.values(ownerCommands).map(
  (command) => command.data
);
