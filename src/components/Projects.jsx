import React, { useState } from "react";
import Identicons from "react-identicons";
import { Link } from "react-router-dom";
import { FaClock, FaHeart, FaCheckCircle, FaStar } from "react-icons/fa";

import { useProjectContext } from "../context/ProjectContext"; // ⭐ LẤY DỮ LIỆU TỪ CONTEXT

const ProjectCard = ({ project, index }) => {
  const {
    id,
    title,
    owner,
    amountRaised,
    target,
    backers,
    daysLeft,
    progress,
    status,
    image,
  } = project;

  const statusColor =
    status === "Goal Met" || status === "Overfunded"
      ? "bg-green-600"
      : "bg-red-600";

  const statusText =
    status === "Goal Met" || status === "Overfunded" ? "FUNDED" : "LIVE";

  const statusIcon =
    status === "Goal Met" || status === "Overfunded" ? (
      <FaStar className="mr-1" />
    ) : null;

  return (
    <div
      className="
      rounded-xl shadow-lg 
      bg-white dark:bg-gray-700 
      w-72 m-4 transition duration-300 
      hover:shadow-2xl hover:scale-[1.03]
    "
    >
      <Link to={`/project/${id}`}> {/* ⭐ DÙNG ID THẬT */}
        <div className="relative">
          <img
            src={image || `https://picsum.photos/400/300?random=${index}`}
            alt={title}
            className="rounded-t-xl h-48 w-full object-cover"
          />

          <span
            className={`absolute top-3 right-3 text-white text-xs font-semibold px-3 py-1 rounded-full ${statusColor} flex items-center`}
          >
            {statusIcon}
            {statusText}
          </span>
        </div>

        <div className="p-5">
          <div className="flex justify-start space-x-2 items-center mb-3">
            <Identicons
              className="rounded-full shadow-md border-2 border-white dark:border-gray-700"
              string={owner}
              size={18}
            />
            <small className="text-gray-700 dark:text-gray-300 font-medium">
              {owner.slice(0, 8) + "..."}
            </small>
          </div>

          <h5 className="font-extrabold text-lg mb-3 leading-snug text-gray-800 dark:text-gray-200">
            {title}
          </h5>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full mb-3 overflow-hidden">
            <div
              className="bg-yellow-500 h-full transition-all duration-700"
              style={{ width: `${progress > 100 ? 100 : progress}%` }}
            />
          </div>

          <div className="flex justify-between items-end text-sm mt-4">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-green-600 dark:text-green-400 flex items-center">
                {amountRaised} ETH
              </span>
              <small className="text-gray-500 dark:text-gray-400 mt-1">
                Raised / {target} ETH
              </small>
            </div>

            <div className="flex flex-col items-end">
              <small
                className={`flex items-center ${
                  daysLeft <= 5 && daysLeft > 0
                    ? "text-red-500"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {daysLeft > 0 ? (
                  <>
                    <FaClock className="mr-1 text-xs" />
                    {daysLeft} days left
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="mr-1 text-base text-blue-500" />
                    Finished
                  </>
                )}
              </small>

              <small className="text-gray-500 dark:text-gray-400 flex items-center mt-1">
                <FaHeart className="mr-1 text-red-500" /> {backers} Backers
              </small>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

const Projects = () => {
  const { projects } = useProjectContext(); // ⭐ DÙNG DATA TỪ CONTEXT

  const [visibleCount, setVisibleCount] = useState(6);
  const [filter, setFilter] = useState("All");

  const filteredProjects = projects.filter((p) => {
    if (filter === "All") return true;
    if (filter === "Active") return p.status === "Active";
    if (filter === "Completed")
      return p.status === "Goal Met" || p.status === "Overfunded";
    return true;
  });

  const projectsToShow = filteredProjects.slice(0, visibleCount);

  return (
    <div className="flex flex-col px-6 py-10 bg-gray-100 dark:bg-gray-800 min-h-screen transition-colors duration-300">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">
        Featured Campaigns
      </h2>

      {/* Filter Buttons */}
      <div className="flex justify-center gap-4 mb-6">
        {["All", "Active", "Completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`
              px-5 py-2 rounded-full font-semibold shadow-md transition-all duration-300
              ${
                filter === f
                  ? "bg-green-600 text-white shadow-lg scale-105"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-gray-600 hover:text-green-700"
              }
            `}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
        {projectsToShow.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>

      {visibleCount < filteredProjects.length && (
        <div className="text-center mt-10">
          <button
            onClick={() => setVisibleCount((prev) => prev + 6)}
            className="px-8 py-3 border-2 border-green-600 text-green-700 dark:text-green-300 font-semibold rounded-full hover:bg-green-600 hover:text-white transition duration-300"
          >
            Load More Campaigns
          </button>
        </div>
      )}
    </div>
  );
};

export default Projects;
