import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import Container from "./Container.tsx";
import { siteName } from "../content/site";

export default function Footer(): ReactElement {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line py-8 text-sm text-ink-soft">
      <Container className="flex flex-wrap items-center justify-between gap-2.5 max-xs:flex-col max-xs:text-center">
        <span>
          © {year} {siteName}
        </span>
        <span>{t("footer.tagline")}</span>
      </Container>
    </footer>
  );
}
