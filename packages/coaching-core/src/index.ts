// The main entry point for everything an app composes into its public
// site. Admin pages are deliberately NOT re-exported here -- they're a
// large, separate bundle (see apps/betti/src/App.tsx's own lazy() calls),
// and barrel-exporting them from this module would pull admin code into
// every consumer's main chunk. Import those directly, e.g.
// `import("@coaching/core/admin/AdminApp.tsx")`.

export { default as Header } from "./components/Header.tsx";
export { default as Footer } from "./components/Footer.tsx";
export { default as ThemeToggle } from "./components/ThemeToggle.tsx";
export { default as QuoteBlock } from "./components/QuoteBlock.tsx";
export { default as Container } from "./components/Container.tsx";
export { default as Section } from "./components/Section.tsx";
export { default as LanguageSwitcher } from "./components/LanguageSwitcher.tsx";

export { default as Hero } from "./sections/Hero.tsx";
export { default as Services } from "./sections/Services.tsx";
export { default as Pricing } from "./sections/Pricing.tsx";
export { default as Community } from "./sections/Community.tsx";
export { default as Booking } from "./sections/Booking.tsx";
export { default as Contact } from "./sections/Contact.tsx";

export { useActiveSection } from "./hooks/useActiveSection.ts";
export { useRevealOnScroll } from "./hooks/useRevealOnScroll.ts";

export { default as ThemeContextProvider } from "./store/ThemeContextProvider.tsx";
export { ThemeContext } from "./store/ThemeContext.ts";

export * from "./api/client.ts";
export * from "./api/endpoints.ts";
export * from "./api/models.ts";

export {
  useCoachConfig,
  type CoachConfig,
  type NavLink,
  type Service,
  type PriceRow,
  type CoachImage,
  type CoachContactInfo,
} from "./CoachConfig.ts";
export { default as CoachConfigProvider } from "./CoachConfigProvider.tsx";

export {
  default as i18n,
  initI18n,
  supportedLanguages,
  type SupportedLanguage,
} from "./i18n.ts";

export { formatPriceHuf } from "./format.ts";
export { beforeSend } from "./analytics.ts";
