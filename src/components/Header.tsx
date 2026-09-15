import { useState, type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import Container from "./Container.tsx";
import LanguageSwitcher from "./LanguageSwitcher.tsx";
import ThemeToggle from "./ThemeToggle.tsx";
import MenuIcon from "./MenuIcon.tsx";
import { navLinks, contactLink } from "../content/navLinks";
import { useActiveSection } from "../hooks/useActiveSection";

const allLinks = [...navLinks, contactLink];
const sectionIds = allLinks.map((link) => link.id);

const desktopLinkClasses =
  "relative pb-[3px] no-underline transition-colors duration-200 hover:text-accent after:absolute after:inset-x-0 after:-bottom-px after:h-px after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300";

const mobileLinkClasses =
  "border-b border-line py-3.5 text-base text-ink no-underline last:border-b-0";

export default function Header(): ReactElement {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const activeId = useActiveSection(sectionIds);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/88 backdrop-blur-[10px]">
      <Container className="flex h-[76px] items-center justify-between">
        <a
          href="#bemutatkozas"
          className="serif flex items-center text-lg text-ink no-underline"
        >
          Gerencsér Bernadett
        </a>

        <nav className="hidden items-center gap-9 text-[15px] text-ink-soft sm:flex">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={[
                desktopLinkClasses,
                activeId === link.id ? "text-accent after:scale-x-100" : "",
              ].join(" ")}
            >
              {t(link.labelKey)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3.5">
          <a
            href={`#${contactLink.id}`}
            className="hidden whitespace-nowrap rounded-full border border-ink px-5 py-2.5 text-sm no-underline transition-colors duration-200 hover:bg-ink hover:text-bg sm:inline-block"
          >
            {t(contactLink.labelKey)}
          </a>
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={t("common.menuToggle")}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-bg-card p-0 text-ink sm:hidden"
          >
            <span className="h-[18px] w-[18px]">
              <MenuIcon />
            </span>
          </button>
        </div>
      </Container>

      {menuOpen && (
        <nav className="flex flex-col border-b border-line bg-bg px-6 pt-2 pb-6 sm:hidden">
          {allLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={closeMenu}
              className={[
                mobileLinkClasses,
                activeId === link.id ? "border-accent" : "",
              ].join(" ")}
            >
              {t(link.labelKey)}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
