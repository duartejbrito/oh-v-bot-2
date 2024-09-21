import { rulesOptions } from "../scheduler";
import * as discord from "./discord";
import * as logger from "./logger";

declare global {
  interface String {
    // eslint-disable-next-line no-unused-vars
    format(...args: string[]): string;
  }
}

Object.defineProperty(String.prototype, "format", {
  value: function (...args: string[]) {
    return this.replace(/{(\d+)}/g, (match: string, number: number) => {
      return typeof args[number] !== "undefined" ? args[number] : match;
    });
  },
  enumerable: false,
});

export function getSelectMenuCommandName(customId: string) {
  return customId.substring(customId.indexOf("-") + 1);
}

export function getSelectMenuOptionsByRule(name: string) {
  const rules = rulesOptions.get(name)!;
  return Array.from(rules.entries()).sort(([keyA], [keyB]) => {
    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  });
}

export const toMilliseconds = (hrs: number, min = 0, sec = 0) =>
  (hrs * 60 * 60 + min * 60 + sec) * 1000;

export const utils = {
  discord,
  logger,
};
