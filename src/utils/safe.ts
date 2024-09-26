import { magenta, yellow } from "colors/safe";

export function logDebug(
  message: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: Record<string, any> = {}
) {
  const now = new Date().toISOString();

  let logMessage = `${now}: ${magenta("[DEBUG]")} ${message}`;
  if (Object.keys(args).length > 0) {
    logMessage += ` ${yellow(JSON.stringify(args))}`;
  }

  console.log(logMessage);
}

export function convertToIso6391(language: string) {
  return language.split("-")[0] === "zh" ? language : language.split("-")[0];
}
