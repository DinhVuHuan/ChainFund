import React, { useState, useEffect } from "react";
import { useProjectContext } from "../context/ProjectContext";
import { createCampaign } from "../services/campaignAPI";
import { checkIfAdmin } from "../services/blockchain";

const CreateProject = () => {
  const { currentAccount, createProject } = useProjectContext();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [duration, setDuration] = useState("");
  const [image, setImage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Check nếu user là admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (currentAccount) {
        const admin = await checkIfAdmin(currentAccount);
        setIsAdmin(admin);
      }
    };
    checkAdmin();
  }, [currentAccount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!title || !description || !target || !duration) {
      setError("Vui lòng điền đầy đủ các trường!");
      return;
    }

    if (!currentAccount) {
      setError("Vui lòng kết nối ví trước!");
      return;
    }

    if (!isAdmin) {
      setError("Chỉ admin mới có thể tạo campaign!");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 1. Tạo campaign trên blockchain + lưu vào Supabase
      const campaign = await createCampaign(currentAccount, {
        title,
        description,
        target,
        duration,
        image
      });

      // 2. Update local state (nếu cần)
      createProject({ title, description, target, duration, image });

      // 3. Clear form và thông báo
      alert("Campaign tạo thành công!");
      setTitle("");
      setDescription("");
      setTarget("");
      setDuration("");
      setImage("");

    } catch (err) {
      console.error("Lỗi tạo campaign:", err);
      setError(err.message || "Lỗi tạo campaign, vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-32 px-6 min-h-screen bg-gray-100 dark:bg-gray-800 transition-colors duration-300">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 dark:text-gray-200 mb-10">
        Create New Campaign
      </h1>

      {/* Admin Check Alert */}
      {!isAdmin && currentAccount && (
        <div className="max-w-3xl mx-auto mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p className="font-semibold">⚠️ Chỉ admin mới có thể tạo campaign</p>
          <p className="text-sm">Ví của bạn: {currentAccount.substring(0, 6)}...{currentAccount.substring(-4)}</p>
        </div>
      )}

      {!currentAccount && (
        <div className="max-w-3xl mx-auto mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
          <p className="font-semibold">⚠️ Vui lòng kết nối ví MetaMask trước</p>
        </div>
      )}

      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-700 shadow-xl rounded-xl p-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300">
              Project Title
            </label>
            <input
              type="text"
              placeholder="e.g. Build a community well..."
              className="w-full mt-2 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-50"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!isAdmin || isLoading}
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              rows="4"
              placeholder="Explain what this campaign is about..."
              className="w-full mt-2 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-50"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!isAdmin || isLoading}
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300">
              Target Amount (ETH)
            </label>
            <input
              type="number"
              placeholder="1.5"
              step="0.01"
              min="0.01"
              className="w-full mt-2 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-50"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              disabled={!isAdmin || isLoading}
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300">
              Duration (days)
            </label>
            <input
              type="number"
              placeholder="30"
              min="1"
              max="365"
              className="w-full mt-2 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-50"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              disabled={!isAdmin || isLoading}
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300">
              Image URL (optional)
            </label>
            <input
              type="text"
              placeholder="https://..."
              className="w-full mt-2 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-50"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              disabled={!isAdmin || isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={!isAdmin || isLoading || !currentAccount}
            className={`mt-6 px-8 py-3 border-2 border-green-600 font-semibold rounded-full transition duration-300 ${
              isAdmin && !isLoading && currentAccount
                ? "text-green-700 dark:text-green-300 hover:bg-green-600 hover:text-white cursor-pointer"
                : "text-gray-400 border-gray-400 cursor-not-allowed opacity-50"
            }`}
          >
            {isLoading ? "Creating Campaign..." : "Create Campaign"}
          </button>
        </form>
      </div>

      <div className="h-12"></div>
    </div>
  );
};

export default CreateProject;
