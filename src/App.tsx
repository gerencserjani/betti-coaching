import "./App.css";
import { useTranslation } from "react-i18next";
import Header from "./components/Header.tsx";
import Hero from "./sections/Hero.tsx";
import QuoteBlock from "./components/QuoteBlock.tsx";
import Services from "./sections/Services.tsx";

function App() {
  const { t } = useTranslation();

  return (
    <>
      <Header />
      <Hero />
      <QuoteBlock
        quote={t("quoteBlock.quote")}
        leadIn={t("quoteBlock.leadIn")}
      />
      <Services />
    </>
  );
}

export default App;
