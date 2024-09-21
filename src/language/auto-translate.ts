import translate from "@iamtraction/google-translate";
import { languages, phrases } from ".";
import * as fs from "fs";
import { logInfo } from "../utils/logger";

function autovivify() {
  return new Proxy(
    {},
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      get: (target: { [key: string]: any }, name: string | symbol) => {
        if (name === "toJSON") {
          return () => target;
        } else {
          return typeof name === "string" && name in target
            ? target[name]
            : // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ((target as any)[name] = autovivify());
        }
      },
    }
  );
}

const translations = autovivify();

Promise.all(
  Object.entries(languages).map(async ([keyLanguage, valueLanguage]) => {
    logInfo(`Translating to ${valueLanguage}...`);
    await Promise.all(
      Object.entries(phrases).map(async ([keyPhrase, valuePhrase]) => {
        await translate(valuePhrase, { to: valueLanguage }).then((res) => {
          translations[keyLanguage][keyPhrase] = res.text;
        });
      })
    );
    logInfo(`Translated to ${valueLanguage}!`);
  })
).then(() => {
  logInfo("Writing translations to file...");
  fs.writeFileSync(
    "src/language/translations.ts",
    `export const translations = ${JSON.stringify(translations)}`
  );
  logInfo("Translations written to file!");
});
