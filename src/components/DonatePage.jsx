import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaEthereum } from 'react-icons/fa';
import { donateToProject } from '../services/blockchain'; // Import hàm blockchain
import { supabase } from '../services/supabaseClients';   // Import supabase

const DonatePage = () => {
  const { id } = useParams(); // Lấy ID dự án (0, 1, 2...)
  const [amount, setAmount] = useState('');
  const [donations, setDonations] = useState([]);

  // Lấy lịch sử donate từ Supabase
  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase.from('donations').select('*').eq('project_id', id);
      if(data) setDonations(data);
    };
    fetchHistory();
  }, [id]);

  const handleDonate = async () => {
    if (!amount) return;
    await donateToProject(id, amount);
    setAmount(''); // Reset ô nhập
  };

  return (
    <div className="flex justify-center pt-20 bg-gray-50 min-h-screen">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md h-fit">
        <h2 className="text-2xl font-bold mb-4 text-center">Donate cho Dự án #{id}</h2>
        
        {/* FORM DONATE */}
        <div className="relative mb-6">
          <input
            type="number"
            placeholder="Số ETH (VD: 0.1)"
            className="w-full pl-10 pr-4 py-3 border rounded-lg"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <FaEthereum className="absolute left-3 top-4 text-gray-400" />
        </div>
        <button onClick={handleDonate} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700">
          Xác nhận Donate
        </button>

        {/* LỊCH SỬ */}
        <div className="mt-8">
            <h3 className="font-bold border-b pb-2 mb-2">Lịch sử ủng hộ</h3>
            {donations.map((item, index) => (
                <div key={index} className="flex justify-between text-sm py-1 border-b">
                    <span className="text-gray-600">{item.backer_address.slice(0,6)}...</span>
                    <span className="text-green-600 font-bold">+{item.amount} ETH</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default DonatePage;