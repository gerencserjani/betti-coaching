import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import hu from "./locales/hu.json";
import en from "./locales/en.json";

export const supportedLanguages = ["hu", "en"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      hu: { translation: hu },
      en: { translation: en },
    },
    fallbackLng: "hu",
    supportedLngs: supportedLanguages,
    detection: {
      order: ["querystring", "localStorage", "navigator"],
      lookupQuerystring: "lang",
      lookupLocalStorage: "lang",
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
  });

function syncDocumentMeta(lng: string) {
  document.documentElement.lang = lng;
  document.title = i18n.t("common.siteTitle");
}

syncDocumentMeta(i18n.language);
i18n.on("languageChanged", syncDocumentMeta);

export default i18n;
