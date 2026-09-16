import { useState, type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import Container from "./Container.tsx";
import LanguageSwitcher from "./LanguageSwitcher.tsx";
import ThemeToggle from "./ThemeToggle.tsx";
import MenuIcon from "./icons/MenuIcon";
import { navLinks, contactLink } from "../content/navLinks";
import { siteName } from "../content/site";
import { useActiveSection } from "../hooks/useActiveSection";
import brandLogo from "../assets/brand-logo.webp";

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
        <a href="#bemutatkozas" className="flex items-center no-underline">
          <img
            src={brandLogo}
            alt={siteName}
            className="h-[52px] w-auto transition-[filter] duration-200 dark:[filter:invert(1)_hue-rotate(180deg)_brightness(1.15)_contrast(0.92)]"
          />
        </a>

        <nav className="hidden items-center gap-9 text-[15px] text-ink-soft xl:flex">
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
            className="hidden whitespace-nowrap rounded-full border border-ink px-5 py-2.5 text-sm no-underline transition-colors duration-200 hover:bg-ink hover:text-bg xl:inline-block"
          >
            {t(contactLink.labelKey)}
          </a>
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={t(
              menuOpen ? "common.menuToggle.close" : "common.menuToggle.open",
            )}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-bg-card p-0 text-ink xl:hidden"
          >
            <MenuIcon size={18} />
          </button>
        </div>
      </Container>

      {menuOpen && (
        <nav
          id="mobile-nav"
          className="flex flex-col border-b border-line bg-bg px-6 pt-2 pb-6 xl:hidden"
        >
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
