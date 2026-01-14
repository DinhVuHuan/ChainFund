// src/components/ExampleComponents.jsx
/**
 * ===== EXAMPLE COMPONENTS =====
 * Những ví dụ sử dụng Campaign API, Donation API, và Blockchain functions
 */

import React, { useState, useEffect } from "react";
import { useProjectContext } from "../context/ProjectContext";

// ===== EXAMPLE 1: Campaign List Component =====
export const CampaignListExample = () => {
  const { projects, loading } = useProjectContext();
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filter, setFilter] = useState("OPEN"); // OPEN, CLOSED, etc.

  useEffect(() => {
    const filtered = projects.filter((p) => p.status === filter);
    setFilteredProjects(filtered);
  }, [projects, filter]);

  if (loading) return <div>Loading campaigns...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Campaigns</h2>

      {/* Filter buttons */}
      <div className="mb-4 flex gap-2">
        {["OPEN", "CLOSED", "EXPIRED", "SUCCESSFUL"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded ${
              filter === status
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Campaign cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((campaign) => (
          <div key={campaign.id} className="border rounded-lg p-4 shadow">
            <img src={campaign.image} alt={campaign.title} className="w-full h-40 object-cover rounded" />
            <h3 className="font-bold text-lg mt-2">{campaign.title}</h3>
            <p className="text-gray-600 text-sm">{campaign.description}</p>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${Math.min(campaign.progress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {campaign.amountRaised} / {campaign.target} ETH
              </p>
            </div>

            {/* Info */}
            <div className="mt-3 text-sm">
              <p>Backers: {campaign.backers}</p>
              <p>Days Left: {campaign.daysLeft}</p>
              <p>Status: {campaign.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== EXAMPLE 2: Donate Modal Component =====
export const DonateModalExample = ({ campaignId, onClose }) => {
  const { currentAccount } = useProjectContext();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDonate = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!currentAccount) {
      setError("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Dynamically import API function
      const { donateToCampaign } = await import("../services/donationAPI");
      
      await donateToCampaign(campaignId, amount, currentAccount);
      alert("Donation successful!");
      onClose();
    } catch (err) {
      setError(err.message || "Donation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-2xl font-bold mb-4">Donate to Campaign</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Amount (ETH)</label>
          <input
            type="number"
            placeholder="0.5"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded px-3 py-2"
            disabled={loading}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDonate}
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Donate"}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== EXAMPLE 3: Donor List Component =====
export const DonorListExample = ({ campaignId }) => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDonors = async () => {
      try {
        const { getDonationsByProject } = await import("../services/donationAPI");
        const donations = await getDonationsByProject(campaignId);
        setDonors(donations);
      } catch (error) {
        console.error("Error loading donors:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDonors();
  }, [campaignId]);

  if (loading) return <div>Loading donors...</div>;

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-3">Recent Supporters</h3>
      <div className="space-y-2">
        {donors.map((donation) => (
          <div key={donation.id} className="flex justify-between items-center p-2 border-b">
            <span className="font-mono text-sm">
              {donation.donor_address.substring(0, 6)}...{donation.donor_address.substring(-4)}
            </span>
            <span className="font-semibold">{donation.amount_eth} ETH</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== EXAMPLE 4: User Statistics Component =====
export const UserStatsExample = () => {
  const { currentAccount } = useProjectContext();
  const [stats, setStats] = useState({
    totalDonated: 0,
    campaignsSupported: 0,
    myProjects: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!currentAccount) {
        setLoading(false);
        return;
      }

      try {
        const {
          getTotalDonatedByUser,
          getProjectCountByDonor,
        } = await import("../services/donationAPI");
        const { getCampaignsByOwner } = await import("../services/campaignAPI");

        const totalDonated = await getTotalDonatedByUser(currentAccount);
        const campaignsSupported = await getProjectCountByDonor(currentAccount);
        const myProjects = await getCampaignsByOwner(currentAccount);

        setStats({
          totalDonated,
          campaignsSupported,
          myProjects,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [currentAccount]);

  if (!currentAccount) {
    return (
      <div className="p-4 text-center text-gray-600">
        Connect your wallet to see your statistics
      </div>
    );
  }

  if (loading) return <div className="p-4">Loading statistics...</div>;

  return (
    <div className="p-6 border rounded-lg bg-gray-50">
      <h2 className="text-xl font-bold mb-4">Your Statistics</h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded text-center">
          <p className="text-gray-600 text-sm">Total Donated</p>
          <p className="text-2xl font-bold text-green-600">{stats.totalDonated.toFixed(4)} ETH</p>
        </div>
        <div className="bg-white p-4 rounded text-center">
          <p className="text-gray-600 text-sm">Campaigns Supported</p>
          <p className="text-2xl font-bold text-blue-600">{stats.campaignsSupported}</p>
        </div>
        <div className="bg-white p-4 rounded text-center">
          <p className="text-gray-600 text-sm">My Campaigns</p>
          <p className="text-2xl font-bold text-purple-600">{stats.myProjects.length}</p>
        </div>
      </div>

      {/* My Campaigns */}
      {stats.myProjects.length > 0 && (
        <div>
          <h3 className="font-bold text-lg mb-2">My Campaigns</h3>
          <div className="space-y-2">
            {stats.myProjects.map((campaign) => (
              <div key={campaign.id} className="bg-white p-3 rounded border">
                <p className="font-semibold">{campaign.title}</p>
                <p className="text-sm text-gray-600">
                  {campaign.raised_amount} / {campaign.target_amount} ETH • Status: {campaign.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ===== EXAMPLE 5: Top Donors Leaderboard =====
export const TopDonorsExample = () => {
  const [topDonors, setTopDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopDonors = async () => {
      try {
        const { getTopDonors } = await import("../services/donationAPI");
        const donors = await getTopDonors(10);
        setTopDonors(donors);
      } catch (error) {
        console.error("Error loading top donors:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTopDonors();
  }, []);

  if (loading) return <div>Loading leaderboard...</div>;

  return (
    <div className="p-6 border rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Top Donors 🏆</h2>
      <div className="space-y-2">
        {topDonors.map((donor, index) => (
          <div key={donor.address} className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
              <span className="font-mono">{donor.address.substring(0, 10)}...{donor.address.substring(-4)}</span>
            </div>
            <span className="text-lg font-bold text-green-600">{donor.totalDonated.toFixed(4)} ETH</span>
          </div>
        ))}
      </div>
    </div>
  );
};
