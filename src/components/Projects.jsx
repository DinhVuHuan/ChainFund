import React, { useState } from "react";
import { useProjectContext } from "../context/ProjectContext";
import { Link } from "react-router-dom";
import { FaClock, FaHeart, FaCheckCircle, FaStar } from "react-icons/fa";

const ProjectCard = ({ p, i }) => {
  const isFunded = p.status === "Goal Met" || p.status === "Overfunded";

  return (
    <Link
      to={`/project/${p.id}`}
      className="
        bg-white dark:bg-gray-700 rounded-xl shadow-lg
        overflow-hidden hover:shadow-2xl transition transform hover:scale-[1.03]
      "
    >
      <div className="relative">
        <img
          src={p.image || `https://picsum.photos/400/300?random=${i}`}
          alt={p.title || "campaign image"}
          className="w-full h-48 object-cover"
        />

        <span
          className={`absolute top-3 right-3 text-white text-xs font-semibold px-3 py-1 rounded-full ${isFunded ? "bg-green-600" : "bg-red-600"
            } flex items-center`}
        >
          {isFunded && <FaStar className="mr-1" />}
          {isFunded ? "FUNDED" : "LIVE"}
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
};

const Projects = () => {
  const { projects } = useProjectContext();

  const [filter, setFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(6);

  // FILTER
  const filteredProjects = projects.filter((p) => {
    if (filter === "All") return true;
    if (filter === "Active") return p.status === "Active";
    if (filter === "Completed")
      return p.status === "Goal Met" || p.status === "Overfunded";
    return true;
  });

  const projectsToShow = filteredProjects.slice(0, visibleCount);

  return (
    <div className="pt-0 px-6 bg-gray-100 dark:bg-gray-800 min-h-screen transition-colors duration-300">

      {/* TITLE */}
      <h1 className="text-4xl font-extrabold text-center text-gray-800 dark:text-gray-200 mb-10">
        Featured Campaigns
      </h1>

      {/* FILTER */}
      <div className="flex justify-center gap-4 mb-8">
        {["All", "Active", "Completed"].map((f) => (
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

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
        {projectsToShow.map((p, i) => (
          <ProjectCard key={p.id ?? i} p={p} i={i} />
        ))}
      </div>

      {/* LOAD MORE / COLLAPSE */}
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

      <div className="h-10 bg-transparent"></div>
    </div>
  );
};

export default Projects;
