import React, { useState } from "react";
import { useProjectContext } from "../context/ProjectContext";
import { Link } from "react-router-dom";
import { FaClock, FaHeart, FaCheckCircle, FaStar } from "react-icons/fa";

const ProjectsPage = () => {
    const ctx = useProjectContext();
    const projects = ctx?.projects || [];

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");
    const [visibleCount, setVisibleCount] = useState(6);

    // SEARCH
    const searchFiltered = projects.filter((p) =>
        (p.title || "").toLowerCase().includes(search.toLowerCase())
    );

    // FILTER
    const filteredProjects = searchFiltered.filter((p) => {
        if (filter === "All") return true;
        if (filter === "Active") return p.status === "Active";
        if (filter === "Expired") return p.status === "Expired";
        if (filter === "Completed") return p.status === "Approved" || p.status === "Goal Met" || p.status === "Overfunded";
        return true;
    });

    // Sort: active first, then newest
    const sorted = [...filteredProjects].sort((a,b)=>{
        const aActive = a.status === 'Active' ? 0 : 1
        const bActive = b.status === 'Active' ? 0 : 1
        if (aActive !== bActive) return aActive - bActive
        return (b.createdAt || 0) - (a.createdAt || 0)
    })

    const projectsToShow = sorted.slice(0, visibleCount);

    return (
        <div className="pt-32 px-6 bg-gray-100 dark:bg-gray-800 min-h-screen transition-colors duration-300">

            {/* TITLE */}
            <h1 className="text-4xl font-extrabold text-center text-gray-800 dark:text-gray-200 mb-10">
                Explore All Campaigns
            </h1>

            {/* SEARCH + FILTER */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">

                {/* SEARCH BOX */}
                <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="
            w-full md:w-1/3 px-4 py-2 rounded-lg border
            border-gray-300 dark:border-gray-700
            bg-white dark:bg-gray-700
            text-gray-800 dark:text-gray-200
            shadow-sm focus:ring-2 focus:ring-green-500 outline-none
          "
                />

                {/* FILTER BUTTONS */}
                <div className="flex gap-3">
                    {["All", "Active", "Expired", "Completed"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2 rounded-full font-semibold shadow-md transition-all duration-300 ${filter === f
                                    ? "bg-green-600 text-white shadow-lg scale-105"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-gray-600 hover:text-green-700"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* COUNT */}
            <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
                Showing <span className="font-bold">{projectsToShow.length}</span> of{" "}
                <span className="font-bold">{filteredProjects.length}</span> campaigns
            </p>

            {/* PROJECT GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
                {projectsToShow.map((p, i) => {
                    const isActive = p.status === 'Active' || p.status === 'OPEN' || p.status === 'Open'
                    const isFunded = p.status === "Approved" || p.status === "Goal Met" || p.status === "Overfunded";

                    return (
                                                <Link
                                                        to={`/project/${p.id}`}
                                                        key={p.id ?? i}
                                                        className={`
                                bg-white dark:bg-gray-700 rounded-xl shadow-lg
                                overflow-hidden hover:shadow-2xl transition transform hover:scale-[1.03]
                                ${!isActive ? 'opacity-60' : ''}
                            `}
                                                >
                            <div className="relative">
                                <img
                                    src={p.image || `https://picsum.photos/400/300?random=${i}`}
                                    alt={p.title || "campaign image"}
                                    className="w-full h-48 object-cover"
                                />

                                            <span
                                                className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full ${isFunded ? 'bg-green-600 text-white' : !isActive ? 'bg-yellow-500 text-white' : 'bg-red-600 text-white'} flex items-center`}
                                            >
                                                {isFunded && <FaStar className="mr-1" />}
                                                {isFunded ? "FUNDED" : (!isActive ? 'EXPIRED' : 'LIVE')}
                                            </span>
                            </div>

                            <div className="p-5">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                                    {p.title}
                                </h3>

                                {/* Progress Bar */}
                                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full mb-3 overflow-hidden">
                                    <div
                                        className="bg-yellow-500 h-full transition-all duration-700"
                                        style={{ width: `${Math.min(100, p.progress || 0)}%` }}
                                    />
                                </div>

                                {/* Raised + Backers */}
                                <div className="flex justify-between items-end text-sm mt-4">
                                    <div className="flex flex-col">
                                        <span className="text-xl font-bold text-green-600 dark:text-green-400">
                                            {p.amountRaised ?? 0} ETH
                                        </span>
                                        <small className="text-gray-500 dark:text-gray-400">
                                            Raised / {p.target ?? 0} ETH
                                        </small>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        {p.daysLeft > 0 ? (
                                            <small className="text-gray-600 dark:text-gray-300 flex items-center">
                                                <FaClock className="mr-1" /> {p.daysLeft} days left
                                            </small>
                                        ) : (
                                            <small className="flex items-center text-blue-500">
                                                <FaCheckCircle className="mr-1" /> Finished
                                            </small>
                                        )}

                                        <small className="text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                            <FaHeart className="mr-1 text-red-500" /> {p.backers ?? 0} Backers
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* LOAD MORE */}
            <div className="text-center mt-10 mb-10">
                {visibleCount < filteredProjects.length ? (
                    <button
                        onClick={() => setVisibleCount((prev) => prev + 6)}
                        className="
              px-8 py-3 border-2 border-green-600
              text-green-700 dark:text-green-300
              font-semibold rounded-full
              hover:bg-green-600 hover:text-white transition duration-300
            "
                    >
                        Load More
                    </button>
                ) : filteredProjects.length > 6 ? (
                    <button
                        onClick={() => setVisibleCount(6)}
                        className="
              px-8 py-3 border-2 border-green-600
              text-green-700 dark:text-green-300
              font-semibold rounded-full
              hover:bg-green-600 hover:text-white transition duration-300
            "
                    >
                        Collapse
                    </button>
                ) : null}
            </div>

            {/* FIX FOOTER GAP */}
            <div className="h-10 bg-transparent"></div>
        </div>
    );
};

export default ProjectsPage;
