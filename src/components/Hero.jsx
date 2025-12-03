import React from 'react';
import { FaWallet, FaPlusCircle, FaHandsHelping, FaChartLine } from "react-icons/fa";

const Hero = () => {
    return (
        <section className="text-center bg-gray-50 text-gray-800 py-24 px-6">

            {/* TITLE */}
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
                <span className="text-gray-900">Transparent Donations.</span>
                <br />
                <span className="uppercase text-green-700">Real Impact.</span>
            </h1>

            {/* SUBTEXT */}
            <p className="text-gray-600 max-w-2xl mx-auto mb-12 text-lg leading-relaxed font-normal">
                Support meaningful projects securely and transparently through blockchain.
            </p>

            {/* BUTTONS */}
            <div className="flex justify-center items-center space-x-4">

                {/* Primary */}
                <button
                    type="button"
                    className="flex items-center px-7 py-3 bg-green-600 text-white font-semibold text-base
                    rounded-full shadow-md hover:bg-green-700 hover:scale-105 transition duration-300"
                >
                    <FaPlusCircle className="mr-2 text-lg" />
                    Start A Campaign
                </button>

                {/* Secondary */}
                <button
                    type="button"
                    className="flex items-center px-7 py-3 border-2 border-green-600 text-green-700
                    font-semibold text-base rounded-full shadow-sm bg-transparent
                    hover:bg-green-100 transition duration-300"
                >
                    <FaHandsHelping className="mr-2 text-lg" />
                    Support A Project
                </button>
            </div>

            {/* STATS */}
            <div className="flex justify-center items-stretch mt-16 space-x-4 max-w-3xl mx-auto">

                {/* Projects */}
                <div className="flex flex-col flex-1 justify-center items-center p-5 bg-white shadow-lg rounded-2xl border-t-4 border-yellow-500">
                    <FaChartLine className="text-yellow-600 text-2xl mb-1" />
                    <span className="text-2xl font-bold text-gray-900 mt-1">0</span>
                    <span className="text-gray-500 text-sm mt-1">Active Projects</span>
                </div>

                {/* Backings */}
                <div className="flex flex-col flex-1 justify-center items-center p-5 bg-white shadow-lg rounded-2xl border-t-4 border-green-500">
                    <FaHandsHelping className="text-green-600 text-2xl mb-1" />
                    <span className="text-2xl font-bold text-gray-900 mt-1">0</span>
                    <span className="text-gray-500 text-sm mt-1">Total Backings</span>
                </div>

                {/* Donated */}
                <div className="flex flex-col flex-1 justify-center items-center p-5 bg-white shadow-lg rounded-2xl border-t-4 border-blue-500">
                    <FaWallet className="text-blue-600 text-2xl mb-1" />
                    <span className="text-2xl font-bold text-gray-900 mt-1">0 ETH</span>
                    <span className="text-gray-500 text-sm mt-1">Value Transferred</span>
                </div>
            </div>
        </section>
    );
};

export default Hero;
