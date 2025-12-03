import React, { useState } from "react";
import { Link } from "react-router-dom";

import { HiMenu, HiX } from "react-icons/hi";
import { LuSun, LuMoon } from "react-icons/lu";
import { GiThreeLeaves } from "react-icons/gi";
import { FaWallet } from "react-icons/fa";

const CharityHeader = () => {
    const [open, setOpen] = useState(false);
    const [dark, setDark] = useState(false);

    return (
        <header
            className={`flex justify-between items-center p-5 fixed top-0 left-0 right-0 border-b-4 shadow
                transition-colors z-50
                ${
                    dark
                        ? "bg-gray-900 text-white border-green-700"
                        : "bg-yellow-50 text-gray-800 border-green-600"
                }
            `}
        >
            {/* LOGO + TITLE */}
            <Link to="/" className="flex items-center space-x-2">
                <GiThreeLeaves
                    className={`text-3xl ${
                        dark ? "text-green-400" : "text-green-600"
                    }`}
                />
                <span
                    className={`text-2xl font-extrabold ${
                        dark ? "text-green-300" : "text-green-700"
                    }`}
                >
                    ChainFund Global
                </span>
            </Link>

            {/* RIGHT SIDE BUTTONS */}
            <div className="flex items-center gap-4">

                {/* THEME TOGGLE */}
                <button
                    onClick={() => setDark(!dark)}
                    className={`p-2 rounded-full transition ${
                        dark
                            ? "bg-gray-700 hover:bg-gray-600"
                            : "bg-yellow-200 hover:bg-yellow-300"
                    }`}
                >
                    {dark ? (
                        <LuSun className="text-xl" />
                    ) : (
                        <LuMoon className="text-xl" />
                    )}
                </button>

                {/* MENU BUTTON */}
                <button onClick={() => setOpen(true)}>
                    <HiMenu className="text-3xl" />
                </button>
            </div>

            {/* SIDEBAR MENU */}
            {open && (
                <div
                    className={`fixed top-0 right-0 w-64 h-full p-5 shadow-lg transition-colors z-50
                        ${dark ? "bg-gray-800 text-white" : "bg-white text-gray-800"}
                    `}
                >
                    {/* CLOSE BUTTON */}
                    <button onClick={() => setOpen(false)}>
                        <HiX className="text-3xl mb-5" />
                    </button>

                    {/* NAV LINKS */}
                    <nav className="flex flex-col gap-5 text-lg">
                        <Link to="/" onClick={() => setOpen(false)}>
                            Home
                        </Link>

                        <Link to="/projects" onClick={() => setOpen(false)}>
                            View Projects
                        </Link>

                        <Link to="/create" onClick={() => setOpen(false)}>
                            Create Campaign
                        </Link>

                        {/* CONNECT WALLET BUTTON (NEW) */}
                        <button
                            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-full mt-5 font-bold 
                                transition-all shadow active:scale-95
                                ${
                                    dark
                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                        : "bg-green-600 hover:bg-green-700 text-white"
                                }
                            `}
                        >
                            <FaWallet className="text-lg" />
                            Connect Wallet
                        </button>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default CharityHeader;
