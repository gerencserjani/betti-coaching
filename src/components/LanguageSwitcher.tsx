import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { supportedLanguages, type SupportedLanguage } from "../i18n";

function syncUrl(lang: SupportedLanguage) {
  const url = new URL(window.location.href);
  url.searchParams.set("lang", lang);
  window.history.replaceState(null, "", url);
}

export default function LanguageSwitcher(): ReactElement {
  const { i18n } = useTranslation();

  return (
    <div className="flex items-center gap-1 text-sm">
      {supportedLanguages.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => {
            void i18n.changeLanguage(lang);
            syncUrl(lang);
          }}
          aria-pressed={i18n.resolvedLanguage === lang}
          className={[
            "rounded-full px-2 py-1 uppercase transition-colors",
            i18n.resolvedLanguage === lang
              ? "text-accent"
              : "text-ink-soft hover:text-ink",
          ].join(" ")}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
