import { blue, magenta, red, yellow } from "colors/safe";

export enum Type {
  /* eslint-disable no-unused-vars */
  INFO,
  WARN,
  ERROR,
  DEBUG,
  /* eslint-enable no-unused-vars */
}

export function log(message: string, type: Type = Type.INFO) {
  const now = new Date().toISOString();

  switch (type) {
    case Type.INFO:
      console.log(`${now}: ${blue(`[${Type[type]}]`)} ${message}`);
      break;
    case Type.WARN:
      console.log(`${now}: ${yellow(`[${Type[type]}]`)} ${message}`);
      break;
    case Type.ERROR:
      console.log(`${now}: ${red(`[${Type[type]}]`)} ${message}`);
      break;
    case Type.DEBUG:
      console.log(`${now}: ${magenta(`[${Type[type]}]`)} ${message}`);
      break;
  }
}

export function logTemplate(message: string, type: Type, ...args: string[]) {
  log(message.format(...args), type);
}

export const logInfo = (message: string) => log(message, Type.INFO);
export const logInfoTemplate = (message: string, ...args: string[]) =>
  logTemplate(message, Type.INFO, ...args);
export const logWarn = (message: string) => log(message, Type.WARN);
export const logWarnTemplate = (message: string, ...args: string[]) =>
  logTemplate(message, Type.WARN, ...args);
export const logError = (message: string | Error) =>
  log(message instanceof Error ? message.message : message, Type.ERROR);
export const logErrorTemplate = (message: string | Error, ...args: string[]) =>
  logTemplate(
    message instanceof Error ? message.message : message,
    Type.ERROR,
    ...args
  );
export const logDebug = (message: string) => log(message, Type.DEBUG);
export const logDebugTemplate = (message: string, ...args: string[]) =>
  logTemplate(message, Type.DEBUG, ...args);
