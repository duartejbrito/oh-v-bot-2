import { Locale } from "discord.js";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import { config } from "../config";
import { convertToIso6391 } from "../utils/safe";

export const translations = {
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
  cargo_message: "The cargo scramble event had a chance to spawn {0}!",
  cargo_footer: "Let's go PvP!!! Thanks blixmix for the alert! 🤣",
  medic_channel_alert_error:
    "[MEDICS/TRUNKS] The bot is not able to send messages/view the channel in the channel you have chosen for cargo scramble spawn alerts, {0}.\nPlease edit the channel settings by right clicking the channel name and make sure the bot or it's role has View Channel, Send Messages, and Embed Links set to the ✅ (green check) and try again.\n-# If you need assistance, please join the support server.",
  setup_medic_channel_ping:
    "{0}, this channel is where medic/trunk alerts will be sent!",
  setup_medic_success:
    "Your medic/trunks alerts output channel has been set to {0}!\nThe role that will be mentioned is {1}.\n**{2}** automatic delete of previous Medic/Trunk spawn alerts.\n-# If you do not get an alert when you expect it, please join the support server and let me know.",
  medic_title: "Once Human Medics/Trunks Reset",
  medic_message: "This is the {0} reset announcement.",
  medic_footer:
    "Log out to the main menu and log back in to see the reset medics/trunks.",
  next_respawns_message:
    "It is {0}:{1} UTC.\nCrates respawn at 00:00 UTC and every 4 hours after.\nCargo Scramble spawns at 12:00, 15:00, 18:30, and 22:00 UTC.\n\nNext crate respawn:\t\t{2} or ~{3}.\nNext Cargo Scramble:\t{4} or ~{5}.",
  info_title: "Info",
  info_crate_title: "Crate Setup",
  info_crate_value:
    "Channel: {0}\nRole: {1}\nAuto Delete: **{2}**\nMutes: **{3}**",
  info_cargo_title: "Cargo Setup",
  info_cargo_value:
    "Channel: {0}\nRole: {1}\nAuto Delete: **{2}**\nMutes: **{3}**",
  info_medic_title: "Medic Setup",
  info_medic_value:
    "Channel: {0}\nRole: {1}\nAuto Delete: **{2}**\nMutes: **{3}**",
  info_footer: "If you want to remove all your settings, type {0}",
};

export const supportedLngs = [
  ...new Set(Object.values(Locale).map(convertToIso6391)),
];

i18next.use(Backend).init({
  lng: "en", // if you're using a language detector, do not define the lng option
  supportedLngs,
  fallbackLng: "en",
  debug: config.I18N_LOGGING,
  saveMissing: true,
  backend: {
    loadPath: "./src/locales/{{lng}}/{{ns}}.json",
    addPath: "./src/locales/{{lng}}/{{ns}}.missing.json",
  },
});

export enum TranslationKey {
  /* eslint-disable no-unused-vars */
  check_channel_type_error = "check_channel_type_error",
  crate_channel_alert_error = "crate_channel_alert_error",
  setup_crate_channel_ping = "setup_crate_channel_ping",
  setup_crate_success = "setup_crate_success",
  crate_title = "crate_title",
  crate_message = "crate_message",
  crate_footer = "crate_footer",
  cargo_channel_alert_error = "cargo_channel_alert_error",
  setup_cargo_channel_ping = "setup_cargo_channel_ping",
  setup_cargo_success = "setup_cargo_success",
  cargo_title = "cargo_title",
  cargo_message = "cargo_message",
  cargo_footer = "cargo_footer",
  medic_channel_alert_error = "medic_channel_alert_error",
  setup_medic_channel_ping = "setup_medic_channel_ping",
  setup_medic_success = "setup_medic_success",
  medic_title = "medic_title",
  medic_message = "medic_message",
  medic_footer = "medic_footer",
  next_respawns_message = "next_respawns_message",
  info_title = "info_title",
  info_crate_title = "info_crate_title",
  info_crate_value = "info_crate_value",
  info_cargo_title = "info_cargo_title",
  info_cargo_value = "info_cargo_value",
  info_medic_title = "info_medic_title",
  info_medic_value = "info_medic_value",
  info_footer = "info_footer",
  /* eslint-enable no-unused-vars */
}

export async function changeLanguage(locale: Locale) {
  await i18next.changeLanguage(convertToIso6391(locale));
}

export function t(key: TranslationKey): string {
  return i18next.t(key);
}
