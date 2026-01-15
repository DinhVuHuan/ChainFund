import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEthereum } from 'react-icons/fa';
import { donateToProject } from '../services/blockchain';
import { supabase } from '../services/supabaseClients';
import { useProjectContext } from '../context/ProjectContext';
import { getProjectFromBlockchain } from '../services/blockchain';

const DonatePage = () => {
  const { id } = useParams();
  const [amount, setAmount] = useState('');
  const [donations, setDonations] = useState([]);
  const navigate = useNavigate();
  const { refreshCampaigns } = useProjectContext();
  const { projects } = useProjectContext();
  const [projectInfo, setProjectInfo] = useState(null);

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

  const refreshHistory = async () => {
    try {
      const { data } = await supabase
        .from('donations')
        .select('*')
        .eq('project_id', id)
        .order('donated_at', { ascending: false })
      if (data) setDonations(data)
    } catch (e) {
      console.warn('Failed to refresh donation history', e)
    }
  }

  useEffect(() => {
    // Try to get project info from context first, otherwise fetch from chain
    const pFromCtx = projects.find(p => String(p.id) === String(id))
    if (pFromCtx) {
      setProjectInfo(pFromCtx)
      return
    }

    const fetchOnChain = async () => {
      try {
        const p = await getProjectFromBlockchain(Number(id))
        setProjectInfo(p)
      } catch (e) {
        console.warn('Cannot load on-chain project info', e)
      }
    }
    fetchOnChain()
  }, [id, projects])

  const handleDonate = async () => {
    if (!amount) return;
    try {
      // Fetch fresh on-chain project state to avoid stale UI cache
      const onChain = await getProjectFromBlockchain(Number(id))
      if (!onChain) {
        alert('Không thể lấy thông tin project từ blockchain')
        return
      }

      if (onChain.owner && onChain.owner !== '0x0000000000000000000000000000000000000000') {
        alert('Owner chưa rút quyền. Donate sẽ khả dụng sau khi owner rút quyền.');
        return;
      }
      if (onChain.status !== 'OPEN') {
        alert('Campaign không còn mở để nhận donate.');
        return;
      }

      const res = await donateToProject(id, amount);

      // handle result below
      if (res && res.success) {
        setAmount('');
        alert('Donate thành công!');
        try {
          if (refreshCampaigns) await refreshCampaigns()
          await refreshHistory()
          if (projects) {
            const updated = projects.find(p => String(p.id) === String(id))
            if (updated) setProjectInfo(updated)
          } else {
            const p = await getProjectFromBlockchain(Number(id))
            if (p) setProjectInfo(p)
          }
        } catch (e) {
          console.warn('refreshCampaigns failed after donation', e)
        }
        navigate(`/project/${id}`, { state: { tab: 'history' } });
        return
      } else {
        alert('Donate thất bại. Xem console để biết chi tiết.')
        return
      }
    } catch (e) {
      console.error('handleDonate error', e)
      alert(e.message || 'Donate thất bại (Xem console)')
      return
    }
    
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

        {/* PROJECT SUMMARY */}
        {projectInfo && (
          <div className="mb-6">
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full mb-3 overflow-hidden">
              <div
                className="bg-yellow-500 h-full transition-all duration-700"
                style={{ width: `${Math.min(100, projectInfo.progress || ( (projectInfo.amountRaised && projectInfo.target) ? (projectInfo.amountRaised / projectInfo.target) * 100 : 0 ))}%` }}
              />
            </div>

            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="text-xl font-bold text-green-600 dark:text-green-400">{projectInfo.amountRaised ?? projectInfo.raised ?? 0} ETH</div>
                <small className="text-gray-500 dark:text-gray-400">Raised of {projectInfo.target ?? projectInfo.cost ?? 0} ETH</small>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                <span className="mr-2 text-red-500">❤️</span>
                <span>{projectInfo.backers ?? 0} Backers</span>
              </div>
            </div>
          </div>
        )}

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
              key={item.id || index}
              className="
                flex justify-between text-sm py-2 border-b
                border-gray-200 dark:border-gray-700
              "
            >
              <span className="text-gray-600 dark:text-gray-300">
                {(() => {
                  const addr = item.donor_address || item.backer_address || item.backer || item.backerAddress || ''
                  if (!addr) return 'Unknown'
                  const a = String(addr)
                  const start = a.length > 6 ? a.slice(0, 6) : a
                  const end = a.length > 4 ? a.slice(-4) : ''
                  return end ? `${start}...${end}` : start
                })()}
              </span>

              <span className="text-green-600 dark:text-green-400 font-bold">
                +{item.amount || item.amount_eth || item.amountEth || '0'} ETH
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DonatePage;
