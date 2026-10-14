import { useTranslation } from "react-i18next";
import Header from "./components/Header.tsx";
import Hero from "./sections/Hero.tsx";
import QuoteBlock from "./components/QuoteBlock.tsx";
import Services from "./sections/Services.tsx";
import Community from "./sections/Community.tsx";
import Pricing from "./sections/Pricing.tsx";
import Booking from "./sections/Booking.tsx";
import Contact from "./sections/Contact.tsx";
import Footer from "./components/Footer.tsx";

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
