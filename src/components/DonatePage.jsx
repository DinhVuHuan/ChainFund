import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaEthereum } from 'react-icons/fa';
import { donateToProject } from '../services/blockchain';
import { supabase } from '../services/supabaseClients';

const DonatePage = () => {
  const { id } = useParams();
  const [amount, setAmount] = useState('');
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('donations')
        .select('*')
        .eq('project_id', id);

      if (data) setDonations(data);
    };
    fetchHistory();
  }, [id]);

  const handleDonate = async () => {
    if (!amount) return;
    await donateToProject(id, amount);
    setAmount('');
  };

  return (
    <div
      className="
        flex justify-center pt-20 min-h-screen
        bg-gray-50 dark:bg-gray-900
        transition-colors duration-300
      "
    >
      <div
        className="
          bg-white dark:bg-gray-800
          p-8 rounded-xl shadow-lg
          w-full max-w-md h-fit
          transition-colors duration-300
        "
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">
          Donate to Project #{id}
        </h2>

        {/* DONATE FORM */}
        <div className="relative mb-6">
          <input
            type="number"
            placeholder="Amount in ETH (e.g., 0.1)"
            className="
              w-full pl-10 pr-4 py-3
              border rounded-lg
              bg-white dark:bg-gray-700
              text-gray-900 dark:text-gray-100
              border-gray-300 dark:border-gray-600
              placeholder-gray-400 dark:placeholder-gray-300
              transition-colors duration-300
            "
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <FaEthereum className="absolute left-3 top-4 text-gray-400 dark:text-gray-300" />
        </div>

        <button
          onClick={handleDonate}
          className="
            w-full bg-green-600 text-white py-3 rounded-lg font-bold
            hover:bg-green-700
            transition
          "
        >
          Confirm Donation
        </button>

        {/* DONATION HISTORY */}
        <div className="mt-8">
          <h3 className="font-bold border-b pb-2 mb-2 text-gray-900 dark:text-gray-200">
            Donation History
          </h3>

          {donations.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No donations yet.
            </p>
          )}

          {donations.map((item, index) => (
            <div
              key={index}
              className="
                flex justify-between text-sm py-2 border-b
                border-gray-200 dark:border-gray-700
              "
            >
              <span className="text-gray-600 dark:text-gray-300">
                {item.backer_address.slice(0, 6)}...
              </span>

              <span className="text-green-600 dark:text-green-400 font-bold">
                +{item.amount} ETH
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DonatePage;
