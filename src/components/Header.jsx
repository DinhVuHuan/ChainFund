import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import { HiMenu, HiX } from "react-icons/hi";
import { LuSun, LuMoon } from "react-icons/lu";
import { GiThreeLeaves } from "react-icons/gi";
import { FaWallet } from "react-icons/fa";

import useDarkMode from "../hooks/useDarkMode";
import { connectWallet } from "../services/blockchain";

const CharityHeader = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [account, setAccount] = useState("");

  const { theme, toggleTheme } = useDarkMode();
  const location = useLocation();

  const isHome = location.pathname === "/";

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Wallet
  const handleConnect = async () => {
    const result = await connectWallet();
    // connectWallet may return either a string address or an object { address, user }
    const address = result?.address ? result.address : result;
    if (address) setAccount(address);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300

        ${
          // ⭐ LOGIC MỚI — đồng bộ tất cả page
          scrolled || !isHome
            ? "backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 shadow-lg border-b border-gray-200 dark:border-gray-700"
            : "bg-transparent"
        }
      `}
    >
      <div className="flex justify-between items-center p-5 px-6 md:px-12">

        {/* LOGO */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="w-11 h-11 flex items-center justify-center rounded-xl shadow-md
              bg-green-600/20 dark:bg-green-700/20
              transition-all duration-300 group-hover:scale-105 group-hover:rotate-3"
          >
            <GiThreeLeaves className="text-3xl text-green-700 dark:text-green-400" />
          </div>

          <span className="text-2xl font-extrabold tracking-wide text-green-700 dark:text-green-200">
            ChainFund <span className="text-green-500 dark:text-green-400">Global</span>
          </span>
        </Link>

        {/* NAV */}
        <nav className="hidden md:flex items-center space-x-10">
          {[
            { name: "Home", path: "/" },
            { name: "Projects", path: "/projects" },
            { name: "Create", path: "/create" },
          ].map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative text-lg font-medium transition ${
                isActive(link.path)
                  ? "text-green-500"
                  : "text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-300"
              }`}
            >
              {link.name}
              {isActive(link.path) && (
                <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-green-500 rounded-full"></span>
              )}
            </Link>
          ))}
        </nav>

        {/* RIGHT BUTTONS */}
        <div className="hidden md:flex items-center space-x-4">
          {/* DARK MODE */}
          <button
            onClick={toggleTheme}
            className="p-3 rounded-xl bg-white/40 dark:bg-gray-700/50 backdrop-blur hover:shadow transition"
          >
            {theme === "dark" ? (
              <LuSun className="text-xl text-yellow-300" />
            ) : (
              <LuMoon className="text-xl text-gray-600" />
            )}
          </button>

          {/* CONNECT WALLET */}
          <button
            onClick={handleConnect}
            disabled={!!account}
            className="flex items-center gap-2 px-5 py-3 rounded-full 
              bg-gradient-to-r from-green-500 to-green-600 text-white 
              font-semibold shadow hover:opacity-90 transition-all"
          >
            <FaWallet className="text-lg" />
            {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
          </button>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          onClick={() => setOpen(true)}
          className="md:hidden p-2 rounded-lg bg-white/40 dark:bg-gray-700/50 backdrop-blur"
        >
          <HiMenu className="text-3xl" />
        </button>
      </div>
    </header>
  );
};

export default CharityHeader;
