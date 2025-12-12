import React, { useState } from "react";
import { useProjectContext } from "../context/ProjectContext";

const CreateProject = () => {
  const { currentAccount, admin, createProject } = useProjectContext();

  // ❗ Tạm thời bỏ check admin, để thử UI
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [duration, setDuration] = useState("");
  const [image, setImage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !target || !duration) {
      alert("Please fill in all required fields.");
      return;
    }

    createProject({ title, description, target, duration, image });
    alert("Project created successfully!");

    setTitle("");
    setDescription("");
    setTarget("");
    setDuration("");
    setImage("");
  };

  return (
    <div className="pt-32 px-6 min-h-screen bg-gray-100 dark:bg-gray-800 transition-colors duration-300">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 dark:text-gray-200 mb-10">
        Create New Campaign
      </h1>

      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-xl p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300">
              Project Title
            </label>
            <input
              type="text"
              placeholder="e.g. Build a community well..."
              className="w-full mt-2 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              rows="4"
              placeholder="Explain what this campaign is about..."
              className="w-full mt-2 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300">
              Target Amount (ETH)
            </label>
            <input
              type="number"
              placeholder="1.5"
              className="w-full mt-2 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300">
              Duration (days)
            </label>
            <input
              type="number"
              placeholder="30"
              className="w-full mt-2 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300">
              Image URL (optional)
            </label>
            <input
              type="text"
              placeholder="https://..."
              className="w-full mt-2 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="mt-6 px-8 py-3 border-2 border-green-600 text-green-700 dark:text-green-300 font-semibold rounded-full hover:bg-green-600 hover:text-white transition duration-300"
          >
            Create Campaign
          </button>
        </form>
      </div>

      <div className="h-12"></div>
    </div>
  );
};

export default CreateProject;
