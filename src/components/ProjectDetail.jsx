import React, { useState, useEffect } from "react";
import { ethers } from 'ethers';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getProjectFromBlockchain } from "../services/blockchain";
import Identicons from "react-identicons";
import { FaClock, FaCheckCircle, FaHeart } from "react-icons/fa";
import { useProjectContext } from "../context/ProjectContext";
import { getDonationsByProject } from "../services/donationAPI";
import { checkIfAdmin, renounceProjectOwnership, triggerAutoPayout } from "../services/blockchain";
import { updateCampaign } from "../services/campaignAPI";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { projects, currentAccount, refreshCampaigns } = useProjectContext();

  const project = projects.find(p => Number(p.id) === Number(id));
  const [projectInfo, setProjectInfo] = useState(null);
  const [currentBlockTime, setCurrentBlockTime] = useState(null);
  const display = projectInfo ?? project;
  const [tab, setTab] = useState("details");
  const [history, setHistory] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({ title: '', description: '', image: '', duration: '' });
  const [isAllowedToEdit, setIsAllowedToEdit] = useState(false);
  const [isProjectOwner, setIsProjectOwner] = useState(false);
  const [isPayoutting, setIsPayoutting] = useState(false);

  useEffect(() => {
    const checkPerms = async () => {
      try {
        // Determine authoritative owner: prefer fresh on-chain value (projectInfo),
        // otherwise fall back to context project. This ensures we compare the
        // wallet to the actual current owner (not necessarily the creator stored elsewhere).
        if (!project && !projectInfo) return setIsAllowedToEdit(false)
        const admin = await checkIfAdmin(currentAccount || '')
        const authoritativeOwner = (projectInfo && projectInfo.owner) ? String(projectInfo.owner) : (project && project.owner ? String(project.owner) : '')
        const zeroAddr = '0x0000000000000000000000000000000000000000'
        const ownerMatch = (currentAccount || '').toLowerCase() === (String(authoritativeOwner || '')).toLowerCase()
        const ownerRenounced = String(authoritativeOwner || '') === zeroAddr
        // If owner has renounced, disable edits for everyone (including admin).
        const canEdit = !ownerRenounced && (admin || ownerMatch)
        setIsAllowedToEdit(canEdit)
        setIsProjectOwner(ownerMatch && !ownerRenounced)
      } catch (e) {
        console.warn('Error checking edit permissions', e)
        setIsAllowedToEdit(false)
        setIsProjectOwner(false)
      }
    }
    checkPerms()
  }, [currentAccount, project, projectInfo])

  useEffect(() => {
    // If navigated with state.tab, set initial tab
    if (location && location.state && location.state.tab) {
      setTab(location.state.tab)
    }

    const load = async () => {
      // load donation history from DB if we have a project id
      if (!project) {
        setHistory([])
      } else {
        try {
          const h = await getDonationsByProject(project.id)
          setHistory(h || [])
        } catch (e) {
          console.warn('Cannot load donation history', e)
          setHistory([])
        }
      }

      // Use context project as initial display, then fetch authoritative on-chain values
      if (project) setProjectInfo(project)

      try {
        const on = await getProjectFromBlockchain(Number(id))
        if (on) setProjectInfo(on)
      } catch (e) {
        console.warn('Cannot fetch on-chain project', e)
      }
    }

    load()
  }, [project, id, location])

  useEffect(() => {
    // fetch latest block timestamp for user visibility
    const fetchBlockTime = async () => {
      try {
        if (typeof window === 'undefined' || !window.ethereum) return
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const block = await provider.getBlock('latest')
        if (block && block.timestamp) setCurrentBlockTime(new Date(block.timestamp * 1000))
      } catch (e) {
        console.warn('Cannot fetch block timestamp', e)
      }
    }

    fetchBlockTime()
    const t = setInterval(fetchBlockTime, 15000)
    return () => clearInterval(t)
  }, [])

  if (!project)
    return (
      <p className="text-center py-10 text-red-500 text-xl">Project not found.</p>
    );

  return (
    <div className="px-6 pb-32 pt-24 bg-gray-100 dark:bg-gray-800 min-h-screen transition-colors duration-300">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-700 rounded-xl shadow-xl p-6">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <Identicons string={display?.owner || 'none'} size={32} />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {display?.title}
            </h2>
            <p className="text-gray-500 dark:text-gray-300 text-sm">
              Owner: {(display?.owner && display.owner !== '0x0000000000000000000000000000000000000000') ? display.owner : 'None'}
              {currentBlockTime && (
                <span className="ml-3 text-xs text-gray-400">• Chain time: {currentBlockTime.toLocaleString()}</span>
              )}
            </p>
        </div>
        </div>

        {/* PAYOUT INFO */}
        {display?.status === 'APPROVED' && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {display?.payOutAt ? (
                (() => {
                  const payoutDate = new Date(display.payOutAt * 1000)
                  const ready = currentBlockTime && (currentBlockTime.getTime() >= payoutDate.getTime())
                  return (
                    <>
                      Payout scheduled at: <strong>{payoutDate.toLocaleString()}</strong>
                      {ready ? (
                        <span className="ml-3 text-green-600">• Ready for payout</span>
                      ) : (
                        <span className="ml-3 text-yellow-600">• Waiting for delay</span>
                      )}
                    </>
                  )
                })()
              ) : (
                <span>PayOut schedule not set yet.</span>
              )}
            </p>

            {/* Trigger Payout button visible to anyone when ready */}
            {display?.payOutAt && currentBlockTime && (currentBlockTime.getTime() >= (display.payOutAt * 1000)) && (
              <div className="mt-2">
                <button
                  onClick={async () => {
                    try {
                      setIsPayoutting(true)
                      const res = await triggerAutoPayout(project.id)
                      if (res && res.success) {
                        await refreshCampaigns()
                        alert('Đã kích hoạt payout — kiểm tra giao dịch trong ví hoặc explorer')
                      } else {
                        alert('Kích hoạt payout thất bại (Xem console)')
                      }
                    } catch (e) {
                      console.error('Trigger payout error', e)
                      alert('Lỗi khi kích hoạt payout (Xem console)')
                    } finally {
                      setIsPayoutting(false)
                    }
                  }}
                  disabled={isPayoutting}
                  className={`mt-2 px-4 py-2 rounded ${isPayoutting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                >
                  {isPayoutting ? 'Triggering payout...' : 'Trigger Payout (requires wallet confirm)'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* IMAGE */}
        <img
          src={display?.image || `https://picsum.photos/600/350?random=${display?.id || id}`}
          alt={display?.title}
          className="rounded-xl w-full h-64 object-cover mb-6"
        />

        {/* STATUS */}
        <div className="flex items-center justify-between mb-6">
          <span
              className={`px-4 py-1 rounded-full text-sm font-semibold ${
                (display?.status === "Active" || display?.status === 'OPEN' || display?.status === 'Open')
                  ? "bg-red-600 text-white"
                  : display?.status === "Expired"
                  ? "bg-yellow-500 text-white"
                  : "bg-green-600 text-white"
              }`}
            >
              {(display?.status === 'Expired') ? 'EXPIRED' : (display?.status === 'OPEN' ? 'Active' : display?.status)}
            </span>

          <p className="flex items-center text-gray-700 dark:text-gray-300 text-sm">
            {(display?.daysLeft ?? project?.daysLeft) > 0 ? (
              <>
                <FaClock className="mr-1" /> {display?.daysLeft ?? project?.daysLeft} days left
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
            style={{ width: `${display?.progress ?? project?.progress ?? 0}%` }}
          ></div>
        </div>

        {/* Raised + Backers */}
        <div className="flex justify-between mb-6 text-gray-800 dark:text-gray-100">
          <div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {display?.amountRaised ?? display?.raised ?? 0} ETH
            </p>
            <small className="text-gray-500 dark:text-gray-300">
              Raised of {display?.goal ?? display?.target ?? display?.cost ?? 0} ETH
            </small>
          </div>

          <p className="flex items-center">
            <FaHeart className="mr-1 text-red-500" /> {display?.backers ?? 0} Backers
          </p>
        </div>

        {/* Edit / TABS */}
        <div className="flex items-center justify-between mb-4">
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

          {isAllowedToEdit && (
            <div className="ml-4">
              {!isEditing ? (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditValues({
                      title: display?.title || '',
                      description: display?.description || '',
                      image: display?.image || '',
                      duration: display?.daysLeft || ''
                    });
                  }}
                  className="px-3 py-2 bg-yellow-500 text-white rounded-md mr-2"
                >
                  Edit
                </button>
              ) : (
                <button onClick={() => setIsEditing(false)} className="px-3 py-2 bg-gray-300 text-gray-800 rounded-md mr-2">Cancel</button>
              )}
            </div>
          )}
        </div>

        {/* DETAILS */}
        {tab === "details" && (
          <div>
            {!isEditing ? (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {display?.description}
              </p>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="font-semibold">Title</label>
                  <input className="w-full mt-2 p-2 border rounded" value={editValues.title} onChange={(e)=>setEditValues({...editValues, title: e.target.value})} />
                </div>
                <div>
                  <label className="font-semibold">Description</label>
                  <textarea className="w-full mt-2 p-2 border rounded" rows={4} value={editValues.description} onChange={(e)=>setEditValues({...editValues, description: e.target.value})} />
                </div>
                <div>
                  <label className="font-semibold">Image URL</label>
                  <input className="w-full mt-2 p-2 border rounded" value={editValues.image} onChange={(e)=>setEditValues({...editValues, image: e.target.value})} />
                </div>
                <div>
                  <label className="font-semibold">Duration (days)</label>
                  <input type="number" className="w-full mt-2 p-2 border rounded" value={editValues.duration} onChange={(e)=>setEditValues({...editValues, duration: e.target.value})} />
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={async ()=>{
                    try {
                      // prepare payload
                      const payload = {
                        title: editValues.title,
                        description: editValues.description,
                        image: editValues.image,
                        duration: editValues.duration
                      }
                      await updateCampaign(project.id, payload)
                      await refreshCampaigns()
                      setIsEditing(false)
                    } catch (e) {
                      console.error('Error updating campaign', e)
                      alert('Cập nhật thất bại. Xem console.')
                    }
                  }}>Save</button>
                  <button className="px-4 py-2 bg-gray-300 rounded" onClick={()=>setIsEditing(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* HISTORY – UI đẹp */}
        {tab === "history" && (
          <div className="space-y-4">
            {history.map((h, i) => (
              <div
                key={h.id || i}
                className="flex items-start gap-4 bg-gray-100 dark:bg-gray-600 p-4 rounded-lg shadow-md"
              >
                <Identicons string={h.donor_address || h.donor || ''} size={32} />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {h.donor_address || h.donor || 'Unknown'}
                  </p>
                  <p className="text-green-600 dark:text-green-400 font-bold text-lg">
                    {h.amount_eth || h.amount || h.amountEth || 0} ETH
                  </p>
                  <p className="text-gray-500 dark:text-gray-300 text-sm">
                    {new Date(h.donated_at || h.donatedAt || h.time || Date.now()).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DONATE BUTTON – fixed bottom */}
      <div className="fixed bottom-0 left-0 w-full px-6 py-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur shadow-2xl">
            {display?.owner && display?.owner !== '0x0000000000000000000000000000000000000000' && isProjectOwner ? (
              <button
                onClick={async () => {
                  try {
                    if (!currentAccount) return alert('Vui lòng kết nối ví trước khi rút quyền owner.')
                    // double-check UI-side that caller is the project owner
                    if ((currentAccount || '').toLowerCase() !== (project.owner || '').toLowerCase()) {
                      return alert('Chỉ owner thực sự của project mới có thể rút quyền owner.')
                    }

                    const confirmMsg = window.confirm('Rút quyền owner sẽ làm bạn mất quyền chỉnh sửa project. Tiếp tục và ký giao dịch qua ví?')
                    if (!confirmMsg) return

                    const res = await renounceProjectOwnership(project.id)
                      if (res && res.success) {
                      await refreshCampaigns()
                      alert('Đã rút quyền owner và lưu ví nhận tiền. Donate đã được kích hoạt.')
                      // reload on-chain project info
                      const on = await getProjectFromBlockchain(Number(id))
                      if (on) setProjectInfo(on)
                    }
                  } catch (e) {
                    console.error('Renounce failed', e)
                    alert('Rút quyền owner thất bại (Xem console)')
                  }
                }}
                className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white text-lg font-semibold shadow-lg transition"
              >
                Withdraw Owner Rights
              </button>
            ) : display?.owner === '0x0000000000000000000000000000000000000000' || !display?.owner ? (
              // Only allow Donate Now when project is still OPEN
              (display?.status === 'OPEN' || project?.status === 'OPEN') ? (
                <button
                  onClick={() => navigate(`/donate/${id}`)}
                  className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 
                text-white text-lg font-semibold shadow-lg transition"
                >
                  Donate Now
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3 rounded-xl bg-gray-400 text-white text-lg font-semibold shadow-lg cursor-not-allowed opacity-70"
                >
                  Campaign Funded
                </button>
              )
            ) : (
              <button
                disabled
                className="w-full py-3 rounded-xl bg-gray-400 text-white text-lg font-semibold shadow-lg cursor-not-allowed opacity-70"
              >
                {display?.status === 'Expired' ? 'Campaign Expired' : 'Donations Closed'}
              </button>
            )}
      </div>
    </div>
  );
};

export default ProjectDetail;
