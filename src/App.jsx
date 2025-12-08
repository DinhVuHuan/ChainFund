import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./views/Home";
import Header from "./components/Header";
import Footer from "./components/Footer";
import DonatePage from "./components/DonatePage";

const App = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">

        {/* Header có nút toggle */}
        <Header darkMode={darkMode} toggleTheme={toggleTheme} />

        {/* Router giữ nguyên logic cũ */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/donate/:id" element={<DonatePage />} />
        </Routes>

        {/* Footer mới */}
        <Footer />

      </div>
    </div>
  );
};

export default App;
