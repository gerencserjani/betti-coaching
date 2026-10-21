import { useTranslation } from "react-i18next";
import {
  Header,
  Hero,
  QuoteBlock,
  Services,
  Community,
  Pricing,
  Booking,
  Contact,
  Footer,
} from "@coaching/core";

export default function PublicSite() {
  const { t } = useTranslation();

  return (
    <>
      <Header />
      <main>
        <Hero />
        <QuoteBlock
          quote={t("quoteBlock.quote")}
          leadIn={t("quoteBlock.leadIn")}
        />
        <Services />
        <Community />
        <Pricing />
        <Booking />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
