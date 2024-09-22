import { translations } from "./translations";

export const languages = {
  bg: "bg",
  hr: "hr",
  cs: "cs",
  da: "da",
  nl: "nl",
  "en-us": "en",
  "en-gb": "en",
  fi: "fi",
  fr: "fr",
  de: "de",
  el: "el",
  hi: "hi",
  hu: "hu",
  id: "id",
  it: "it",
  ja: "ja",
  ko: "ko",
  lt: "lt",
  no: "no",
  pl: "pl",
  "pt-br": "pt",
  ro: "ro",
  ru: "ru",
  "es-es": "es",
  "es-419": "es",
  "sv-se": "sv",
  th: "th",
  tr: "tr",
  uk: "uk",
  vi: "vi",
  "zh-cn": "zh-CN",
  "zh-tw": "zh-TW",
};

export const phrases = {
  check_channel_type_error:
    "This bot only supports text/announcement channels.\nPlease {0} your channel again.",
  crate_channel_alert_error:
    "[CRATE] The bot is not able to send messages/view the channel in the channel you have chosen for Weapon/Gear crate respawn alerts, {0}.\nPlease edit the channel settings by right clicking the channel name and make sure the bot or it's role has View Channel, Send Messages, and Embed Links set to the ✅ (green check) and try again.\n-# If you need assistance, please join the support server.",
  setup_crate_channel_ping:
    "{0}, this channel is where weapon/gear crate respawn alerts will be sent!",
  setup_crate_success:
    "Your crate alerts output channel has been set to {0}!\nThe role that will be mentioned is {1}.\n**{2}** automatic delete of previous Weapon/Gear Crate respawn alerts.\n-# If you do not get an alert when you expect it, please join the support server and let me know.",
  crate_title: "Once Human Gear/Weapon Crates Reset",
  crate_message: "This is the {0} reset announcement.",
  crate_footer:
    "Log out to the main menu and log back in to see the reset chests.",
  cargo_channel_alert_error:
    "[CARGO] The bot is not able to send messages/view the channel in the channel you have chosen for cargo scramble spawn alerts, {0}.\nPlease edit the channel settings by right clicking the channel name and make sure the bot or it's role has View Channel, Send Messages, and Embed Links set to the ✅ (green check) and try again.\n-# If you need assistance, please join the support server.",
  setup_cargo_channel_ping:
    "{0}, this channel is where cargo scramble alerts will be sent!",
  setup_cargo_success:
    "Your cargo scramble alerts output channel has been set to {0}!\nThe role that will be mentioned is {1}.\n**{2}** automatic delete of previous Cargo Scramble spawn alerts.\n-# If you do not get an alert when you expect it, please join the support server and let me know.",
  cargo_title: "Once Human Cargo Scramble Spawn",
  cargo_message: "The cargo scramble event has a chance to spawn {0}!",
  next_respawns_message:
    "It is {0}:{1} UTC.\nCrates respawn at 00:00 UTC and every 4 hours after.\nCargo Scramble spawns at 12:00, 15:00, 18:30, and 22:00 UTC.\n\nNext crate respawn:\t\t{2} or ~{3}.\nNext Cargo Scramble:\t{4} or ~{5}.",
  info_message: "{0} {1} {2} {3}\n{4} {5} {6} {7}",
};

export type TranslationLocale = keyof typeof translations;

export const translation = (locale: TranslationLocale) => {
  return translations[locale] || translations["en-us"];
};
