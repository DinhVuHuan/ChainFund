import React from 'react';
import { FaWallet, FaPlusCircle, FaHandsHelping, FaChartLine } from "react-icons/fa";

const Hero = () => {
    return (
        <section className="text-center 
            bg-gray-100 dark:bg-gray-800 
            text-gray-700 dark:text-gray-300 
            py-24 px-6 transition-colors duration-300">

            {/* TITLE */}
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
                <span className="text-gray-800 dark:text-gray-200">Transparent Donations.</span>
                <br />
                <span className="uppercase text-green-700 dark:text-green-400">Real Impact.</span>
            </h1>

            {/* SUBTEXT */}
            <p className="text-gray-600 dark:text-gray-400 
                max-w-2xl mx-auto mb-12 text-lg leading-relaxed font-normal">
                Support meaningful projects securely and transparently through blockchain.
            </p>

            {/* BUTTONS */}
            <div className="flex justify-center items-center space-x-4">

                {/* Primary */}
                <button
                    type="button"
                    className="flex items-center px-7 py-3 
                    bg-green-600 text-white 
                    font-semibold text-base rounded-full shadow 
                    hover:bg-green-700 hover:scale-105 transition duration-300"
                >
                    <FaPlusCircle className="mr-2 text-lg" />
                    Start A Campaign
                </button>

                {/* Secondary */}
                <button
                    type="button"
                    className="flex items-center px-7 py-3 
                    border-2 border-green-600 
                    text-green-700 dark:text-green-300 
                    font-semibold text-base rounded-full 
                    bg-transparent dark:bg-gray-700
                    hover:bg-green-100 dark:hover:bg-gray-600
                    transition duration-300"
                >
                    <FaHandsHelping className="mr-2 text-lg" />
                    Support A Project
                </button>
            </div>

            {/* STATS */}
            <div className="flex justify-center items-stretch mt-16 space-x-4 max-w-3xl mx-auto">

                {/* Projects */}
                <div className="flex flex-col flex-1 justify-center items-center 
                    p-5 bg-white dark:bg-gray-700 
                    shadow-md rounded-2xl border-t-4 border-yellow-500 
                    transition-colors duration-300">
                    <FaChartLine className="text-yellow-600 text-2xl mb-1" />
                    <span className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">0</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm mt-1">Active Projects</span>
                </div>

                {/* Backings */}
                <div className="flex flex-col flex-1 justify-center items-center 
                    p-5 bg-white dark:bg-gray-700 
                    shadow-md rounded-2xl border-t-4 border-green-500
                    transition-colors duration-300">
                    <FaHandsHelping className="text-green-600 text-2xl mb-1" />
                    <span className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">0</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm mt-1">Total Backings</span>
                </div>

                {/* Donated */}
                <div className="flex flex-col flex-1 justify-center items-center 
                    p-5 bg-white dark:bg-gray-700 
                    shadow-md rounded-2xl border-t-4 border-blue-500
                    transition-colors duration-300">
                    <FaWallet className="text-blue-600 text-2xl mb-1" />
                    <span className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">0 ETH</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm mt-1">Value Transferred</span>
                </div>
            </div>
        </section>
    );
};

export default Hero;
