import "./App.css";
import ThemeToggle from "./components/ThemeToggle.tsx";
import LanguageSwitcher from "./components/LanguageSwitcher.tsx";

function App() {
  return (
    <>
      <LanguageSwitcher />
      <ThemeToggle />
    </>
  );
}

export default App;
