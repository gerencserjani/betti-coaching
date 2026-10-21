import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import hu from "./locales/hu.json";
import en from "./locales/en.json";
import { siteUrl } from "../content/site";

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

function setMetaContent(selector: string, content: string) {
  document.querySelector(selector)?.setAttribute("content", content);
}

function syncDocumentMeta(lng: string) {
  document.documentElement.lang = lng;

  const title = i18n.t("common.siteTitle");
  const description = i18n.t("common.siteDescription");

  document.title = title;
  setMetaContent('meta[name="description"]', description);
  setMetaContent('meta[property="og:title"]', title);
  setMetaContent('meta[property="og:description"]', description);
  setMetaContent(
    'meta[property="og:locale"]',
    lng === "en" ? "en_US" : "hu_HU",
  );
  setMetaContent(
    'meta[property="og:locale:alternate"]',
    lng === "en" ? "hu_HU" : "en_US",
  );
  setMetaContent('meta[name="twitter:title"]', title);
  setMetaContent('meta[name="twitter:description"]', description);

  const canonicalUrl = lng === "hu" ? `${siteUrl}/` : `${siteUrl}/?lang=${lng}`;
  document
    .querySelector('link[rel="canonical"]')
    ?.setAttribute("href", canonicalUrl);
  setMetaContent('meta[property="og:url"]', canonicalUrl);
}

syncDocumentMeta(i18n.language);
i18n.on("languageChanged", syncDocumentMeta);

export default i18n;
