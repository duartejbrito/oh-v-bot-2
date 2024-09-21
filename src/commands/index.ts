import * as cargo from "./cargo";
import * as crate from "./crate";
import * as deploy from "./deploy";
import * as next from "./next";
import * as ping from "./ping";

export const allCommands = {
  ping,
  next,
  crate,
  cargo,
  deploy,
};

export const commands = {
  ping,
  next,
  crate,
  cargo,
};

export const selectMenusCommands = {
  crate,
  cargo,
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

export const selectMenusCommandsData = Object.values(selectMenusCommands).map(
  (command) => command.data
);
