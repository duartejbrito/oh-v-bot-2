import translate from "@iamtraction/google-translate";
import * as fs from "fs";
import * as path from "path";
import { convertToIso6391 } from "../utils";
import { logDebug } from "../utils/logger";
import { supportedLngs, translations } from ".";

function writeJsonToFile(filePath: string, data: { [key: string]: string }) {
  const absolutePath = path.resolve(filePath);
  const dir = path.dirname(absolutePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(absolutePath, JSON.stringify(data));
}

// function wrapStringsWithSpan(text: string, stringsToWrap: string[]): string {
//   stringsToWrap.forEach((str) => {
//     const regex = new RegExp(str, "g");
//     text = text.replace(regex, `<span translate="no">${str}</span>`);
//   });
//   return text;
// }

(async () => {
  supportedLngs.map(async (language) => {
    logDebug("Translating...", { Language: language });
    const translatedPhrases: { [key: string]: string } = {};

    await Promise.all(
      Object.entries(translations).map(async ([key, value]) => {
        // const escapedValue = wrapStringsWithSpan(value, ["Once Human"]);

        // if (key === "crate_title") console.log(escapedValue);

        const res = await translate(value, {
          to: convertToIso6391(language),
        });

        // if (key === "crate_title") console.log(res.text);

        translatedPhrases[key] = res.text;
      })
    );

    const outputFilePath = `src/locales/${language}/translation.json`;
    writeJsonToFile(outputFilePath, translatedPhrases);
    logDebug("Translated!!!", {
      Language: language,
      OutputFilePath: outputFilePath,
    });
  });
})();
