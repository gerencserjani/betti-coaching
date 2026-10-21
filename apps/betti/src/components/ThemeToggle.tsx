import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../store/ThemeContext";
import SunIcon from "./icons/SunIcon";
import MoonIcon from "./icons/MoonIcon";

export default function ThemeToggle(): ReactElement {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => toggleTheme()}
      aria-label={t(
        isDark ? "common.themeToggle.toLight" : "common.themeToggle.toDark",
      )}
      aria-pressed={isDark}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-bg-card p-0 text-ink transition-[border-color,transform] duration-200 hover:scale-105 hover:border-accent hover:text-accent"
    >
      {isDark ? <SunIcon size={19} /> : <MoonIcon size={19} />}
    </button>
  );
}
