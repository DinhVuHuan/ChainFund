import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Identicons from "react-identicons";
import { FaClock, FaCheckCircle, FaHeart } from "react-icons/fa";

const MOCK_PROJECTS = [
  {
    title: "Emergency Flood Relief for Central Vietnam",
    owner: "0x1234...ABCD",
    amountRaised: 2.5,
    goal: 5,
    backers: 150,
    daysLeft: 10,
    progress: 50,
    status: "Active",
    description:
      "This campaign provides emergency support to families affected by severe flooding in Central Vietnam. Donations will be used for food, shelter, medicine, and rebuilding efforts.",
    history: [
      { donor: "0x1111...AAAA", amount: 0.5, time: "2 hours ago" },
      { donor: "0x2222...BBBB", amount: 1.0, time: "1 day ago" },
      { donor: "0x3333...CCCC", amount: 0.3, time: "3 days ago" },
    ],
  },
  {
    title: "Build a Sustainable School in Remote Area",
    owner: "0x5678...EFGH",
    amountRaised: 10,
    goal: 10,
    backers: 300,
    daysLeft: 0,
    progress: 100,
    status: "Goal Met",
    description: "A project aiming to build a small eco-friendly school for children...",
    history: [{ donor: "0x9999...ZZZZ", amount: 2, time: "3 days ago" }],
  },
];

const ProjectDetail = () => {
  const { id } = useParams();
  const project = MOCK_PROJECTS[id];
  const navigate = useNavigate();

  const [tab, setTab] = useState("details");

  if (!project) return <p className="text-center py-10 text-red-500">Project not found.</p>;

  return (
    <div className="px-6 pb-32 pt-24 bg-gray-100 dark:bg-gray-800 min-h-screen transition-colors duration-300">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-700 rounded-xl shadow-xl p-6">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <Identicons string={project.owner} size={32} />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{project.title}</h2>
            <p className="text-gray-500 dark:text-gray-300 text-sm">Owner: {project.owner}</p>
          </div>
        </div>

        {/* IMAGE */}
        <img
          src={`https://picsum.photos/600/350?random=${id}`}
          alt={project.title}
          className="rounded-xl w-full h-64 object-cover mb-6"
        />

        {/* STATUS */}
        <div className="flex items-center justify-between mb-6">
          <span
            className={`px-4 py-1 rounded-full text-white text-sm font-semibold ${
              project.status === "Active" ? "bg-red-600" : "bg-green-600"
            }`}
          >
            {project.status}
          </span>

          <p className="flex items-center text-gray-700 dark:text-gray-300 text-sm">
            {project.daysLeft > 0 ? (
              <>
                <FaClock className="mr-1" /> {project.daysLeft} days left
              </>
            ) : (
              <>
                <FaCheckCircle className="mr-1 text-blue-500" /> Finished
              </>
            )}
          </p>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full bg-gray-300 dark:bg-gray-600 h-3 rounded-full overflow-hidden mb-4">
          <div
            className="bg-yellow-500 h-full"
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>

        {/* Raised + Backers */}
        <div className="flex justify-between mb-6 text-gray-800 dark:text-gray-100">
          <div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {project.amountRaised} ETH
            </p>
            <small className="text-gray-500 dark:text-gray-300">Raised of {project.goal} ETH</small>
          </div>

          <p className="flex items-center">
            <FaHeart className="mr-1 text-red-500" /> {project.backers} Backers
          </p>
        </div>

        {/* TABS */}
        <div className="flex border-b dark:border-gray-500 mb-6">
          {["details", "history"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 uppercase text-sm font-semibold transition
                ${
                  tab === t
                    ? "border-b-2 border-green-600 text-green-600 dark:text-green-400"
                    : "text-gray-500 dark:text-gray-300"
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* DETAILS */}
        {tab === "details" && (
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{project.description}</p>
        )}

        {/* HISTORY – UI đẹp dạng timeline */}
        {tab === "history" && (
          <div className="space-y-4">
            {project.history.map((h, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-gray-100 dark:bg-gray-600 p-4 rounded-lg shadow-md"
              >
                <Identicons string={h.donor} size={32} className="rounded-full" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{h.donor}</p>
                  <p className="text-green-600 dark:text-green-400 font-bold text-lg">
                    {h.amount} ETH
                  </p>
                  <p className="text-gray-500 dark:text-gray-300 text-sm">{h.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DONATE BUTTON – luôn cố định dưới */}
      <div className="fixed bottom-0 left-0 w-full px-6 py-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur shadow-2xl">
        <button
          onClick={() => navigate(`/donate/${id}`)}
          className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 
          text-white text-lg font-semibold shadow-lg transition"
        >
          Donate Now
        </button>
      </div>
    </div>
  );
};

export default ProjectDetail;
