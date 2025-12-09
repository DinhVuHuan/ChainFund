import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./views/Home";
import Header from "./components/Header";
import Footer from "./components/Footer";
import DonatePage from "./components/DonatePage";
import ProjectDetail from "./components/ProjectDetail";

const App = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // Áp dụng dark mode khi load trang
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);

    document.documentElement.classList.toggle("dark", newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  return (
    <div>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Header darkMode={darkMode} toggleTheme={toggleTheme} />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/donate/:id" element={<DonatePage />} />
        </Routes>

        <Footer />
      </div>
    </div>
  );
};

export default App;
