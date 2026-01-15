import { ethers } from 'ethers'
import { supabase } from './supabaseClients'
import GenesisABI from '../abis/src/contracts/Genesis.sol/Genesis.json'
import { CONTRACT_CONFIG } from '../config/appConfig'
import { recordDonation } from './donationAPI'

// Helper: get a provider. Prefer injected `window.ethereum`, otherwise use RPC URL from config.
const getProvider = (useSigner = false) => {
  if (typeof window !== 'undefined' && window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    return useSigner ? provider.getSigner() : provider
  }

  if (CONTRACT_CONFIG && CONTRACT_CONFIG.rpcUrl) {
    const provider = new ethers.providers.JsonRpcProvider(CONTRACT_CONFIG.rpcUrl)
    return provider
  }

  throw new Error('No provider available. Install MetaMask or set REACT_APP_RPC_URL')
}

const contractAddress = CONTRACT_CONFIG.address 

// --- HÀM 1: LOGIN ---
export const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      alert("Cài MetaMask đi bạn!");
      return null;
    }

    const provider = getProvider()
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const lowerAddress = address.toLowerCase();

    console.log("Đã kết nối ví:", lowerAddress);

    // Lấy user từ Supabase; xử lý trường hợp no-rows
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('address', lowerAddress)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase select error:', error);
      throw error;
    }

    // Nếu user chưa tồn tại, tạo mới kèm nonce
    if (!user) {
      const nonce = Math.floor(Math.random() * 1000000).toString();
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{ address: lowerAddress, is_admin: false, nonce }])
        .select()
        .single();

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        throw insertError;
      }

      user = newUser;
    }

    // Nếu user có nhưng thiếu nonce thì cập nhật
    if (!user.nonce) {
      const nonce = Math.floor(Math.random() * 1000000).toString();
      const { error: updateError } = await supabase
        .from('users')
        .update({ nonce })
        .eq('address', lowerAddress);
      if (updateError) {
        console.error('Supabase update nonce error:', updateError);
        throw updateError;
      }
      user.nonce = nonce;
    }

    const message = `Welcome! Please sign this nonce: ${user.nonce}`;
    const signature = await signer.signMessage(message);
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== lowerAddress) {
      alert('Chữ ký sai!');
      return null;
    }

    // Cập nhật nonce mới để tránh replay
    const newNonce = Math.floor(Math.random() * 1000000).toString();
    const { error: finalUpdateError } = await supabase
      .from('users')
      .update({ nonce: newNonce })
      .eq('address', lowerAddress);

    if (finalUpdateError) console.error('Supabase nonce final update error:', finalUpdateError);

    return { address: lowerAddress, user };

  } catch (error) {
    console.error("Lỗi login:", error);
    alert("Lỗi đăng nhập (Xem console)");
    return null;
  }
}

// Check admin status
export const checkIfAdmin = async (walletAddress) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('address', walletAddress.toLowerCase())
      .single()

    if (error) return false
    return data?.is_admin || false
  } catch (error) {
    console.error("Lỗi check admin:", error)
    return false
  }
}

// Get user info
export const getUserInfo = async (walletAddress) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('address', walletAddress.toLowerCase())
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data || null
  } catch (error) {
    console.error("Lỗi lấy user info:", error)
    return null
  }
}

// Get wallet balance
export const getWalletBalance = async (walletAddress) => {
  try {
    const provider = getProvider(false)
    const balance = await provider.getBalance(walletAddress)
    return ethers.utils.formatEther(balance)
  } catch (error) {
    console.error("Lỗi lấy balance:", error)
    return "0"
  }
}

// Get contract balance
export const getContractBalance = async () => {
  try {
    const provider = getProvider(false)
    const balance = await provider.getBalance(contractAddress)
    return ethers.utils.formatEther(balance)
  } catch (error) {
    console.error("Lỗi lấy contract balance:", error)
    return "0"
  }
}

// Disconnect wallet
export const disconnectWallet = () => {
  console.log("Wallet disconnected")
}

// --- HÀM 2: DONATE (ĐÃ SỬA GAS LIMIT) ---
export const donateToProject = async (projectId, ethAmount) => {
  try {
    if (!window.ethereum) return alert("Chưa kết nối ví");
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, GenesisABI.abi, signer);
    const address = await signer.getAddress();

    // Sanity-check: ensure project exists and is OPEN before attempting to send value
    try {
      const proj = await contract.getProject(projectId)
      // proj.status is an enum value; 0 == OPEN
      const statusVal = proj.status && proj.status.toNumber ? proj.status.toNumber() : Number(proj.status)

      // Robustly parse owner address (handle different return shapes)
      let ownerAddr = null
      try {
        ownerAddr = proj.owner && proj.owner.toString ? proj.owner.toString() : String(proj.owner)
      } catch (e) {
        ownerAddr = String(proj.owner)
      }

      const zeroAddr = '0x0000000000000000000000000000000000000000'
      const isOwnerRenounced = ownerAddr && ownerAddr.toLowerCase ? ownerAddr.toLowerCase() === zeroAddr : ownerAddr === zeroAddr

      // Debug: if check fails and owner looks unexpected, log the raw proj for inspection
      if (!isOwnerRenounced || statusVal !== 0) {
        if (!isOwnerRenounced) console.warn('donateToProject: owner not renounced:', { projectId, ownerAddr, raw: proj })
        if (statusVal !== 0) console.warn('donateToProject: project not OPEN for backing:', { projectId, statusVal, raw: proj })
        throw new Error('Project is not open for backing')
      }
    } catch (e) {
      console.error('Pre-check failed for project:', e)
      alert('Không thể donate: project không tồn tại hoặc không mở (kiểm tra projectId)')
      return { success: false, error: e }
    }

    // 1. Gửi tiền trên Blockchain
    const parsedAmount = ethers.utils.parseEther(ethAmount.toString());
    
    // --- SỬA Ở ĐÂY: Thêm gasLimit thủ công ---
    const tx = await contract.backProject(projectId, { 
        value: parsedAmount,
        gasLimit: 500000 // Ép buộc dùng 500k gas (dư sức chạy)
    });
    
    console.log("Đang chờ xác nhận...", tx.hash);
    await tx.wait(); 

    // 2. Ghi donation vào DB (sử dụng helper chung để update raised_amount)
    await recordDonation(projectId, ethAmount, address, tx.hash)

    console.log("Donation thành công!")
    return { success: true, txHash: tx.hash }

  } catch (error) {
    console.error("Lỗi donate:", error);
    // In chi tiết lỗi ra để debug nếu vẫn bị
    if (error.data) console.error("Chi tiết lỗi contract:", error.data);
    
    alert("Donate thất bại! (Xem console để biết chi tiết)");
  }
}

export const getDonationHistory = async (userAddress) => {
  try {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('donor_address', userAddress.toLowerCase())
      .order('id', { ascending: false });

    if (error) throw error;
    return data;

  } catch (err) {
    console.error("Lỗi lấy donation history:", err);
    return [];
  }
}

// Get project from blockchain
export const getProjectFromBlockchain = async (projectId) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, GenesisABI.abi, provider);
    
    const project = await contract.getProject(projectId);
    
    // Safe parsing helpers: avoid throwing when BigNumber.toNumber overflows
    const safeToNumber = (bn) => {
      try {
        if (bn && bn.toNumber) return bn.toNumber()
        return Number(bn)
      } catch (e) {
        return null
      }
    }

    let statusIndex = safeToNumber(project.status)
    const backersCount = safeToNumber(project.backers)
    const payOutAt = safeToNumber(project.payOutAt)

    // If status parsing failed (overflow or unexpected), fallback to computing status from raised/cost
    if (statusIndex === null) {
      try {
        const costBn = project.cost && project.cost.toString ? BigInt(project.cost.toString()) : BigInt(String(project.cost || 0))
        const raisedBn = project.raised && project.raised.toString ? BigInt(project.raised.toString()) : BigInt(String(project.raised || 0))
        statusIndex = (raisedBn >= costBn) ? 1 : 0
      } catch (e) {
        statusIndex = 0
      }
    }

    return {
      id: projectId,
      owner: project.owner,
      title: project.title,
      description: project.description,
      imageURL: project.imageURL,
      cost: ethers.utils.formatEther(project.cost),
      raised: ethers.utils.formatEther(project.raised),
      timestamp: new Date(project.timestamp * 1000),
      expiresAt: new Date(project.expiresAt * 1000),
      payoutWallet: project.payoutWallet || null,
      payOutAt: payOutAt,
      backers: backersCount,
      status: ['OPEN', 'APPROVED', 'REVERTED', 'DELETED', 'PAIDOUT'][statusIndex]
    };
  } catch (error) {
    console.error("Lỗi lấy project từ blockchain:", error);
    return null;
  }
}

// Get all projects from blockchain
export const getAllProjectsFromBlockchain = async () => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, GenesisABI.abi, provider);
    
    const projects = await contract.getProjects();
    
    return projects.map((p, idx) => {
      const safeToNumber = (bn) => {
        try {
          if (bn && bn.toNumber) return bn.toNumber()
          return Number(bn)
        } catch (e) {
          return null
        }
      }

      let statusIndex = safeToNumber(p.status)
      const backersCount = safeToNumber(p.backers)
      const payOutAt = safeToNumber(p.payOutAt)

      if (statusIndex === null) {
        try {
          const costBn = p.cost && p.cost.toString ? BigInt(p.cost.toString()) : BigInt(String(p.cost || 0))
          const raisedBn = p.raised && p.raised.toString ? BigInt(p.raised.toString()) : BigInt(String(p.raised || 0))
          statusIndex = (raisedBn >= costBn) ? 1 : 0
        } catch (e) {
          statusIndex = 0
        }
      }

      return {
        id: idx,
        owner: p.owner,
        title: p.title,
        description: p.description,
        imageURL: p.imageURL,
        cost: ethers.utils.formatEther(p.cost),
        raised: ethers.utils.formatEther(p.raised),
        timestamp: new Date(p.timestamp * 1000),
        expiresAt: new Date(p.expiresAt * 1000),
        payoutWallet: p.payoutWallet || null,
        payOutAt: payOutAt,
        backers: backersCount,
        status: ['OPEN', 'APPROVED', 'REVERTED', 'DELETED', 'PAIDOUT'][statusIndex]
      }
    });
  } catch (error) {
    console.error("Lỗi lấy tất cả projects:", error);
    return [];
  }
}

export const renounceProjectOwnership = async (projectId) => {
  try {
    if (!window.ethereum) return alert('Chưa kết nối ví')
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, GenesisABI.abi, signer)

    const tx = await contract.renounceProjectOwnership(projectId)
    await tx.wait()
    return { success: true, txHash: tx.hash }
  } catch (err) {
    console.error('renounceProjectOwnership failed', err)
    alert('Rút quyền owner thất bại (Xem console)')
    return { success: false, error: err }
  }
}

export const triggerAutoPayout = async (projectId) => {
  try {
    if (!window.ethereum) return alert('Chưa kết nối ví')
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, GenesisABI.abi, signer)

    const tx = await contract.triggerAutoPayout(projectId)
    await tx.wait()
    return { success: true, txHash: tx.hash }
  } catch (err) {
    console.error('triggerAutoPayout failed', err)
    return { success: false, error: err }
  }
}

// Get backers of project
export const getBackersOfProject = async (projectId) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, GenesisABI.abi, provider);
    
    const backers = await contract.getBackers(projectId);
    
    return backers.map(b => ({
      owner: b.owner,
      contribution: ethers.utils.formatEther(b.contribution),
      timestamp: new Date(b.timestamp * 1000),
      refunded: b.refunded
    }));
  } catch (error) {
    console.error("Lỗi lấy danh sách backers:", error);
    return [];
  }
}

// Get contract stats
export const getContractStats = async () => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, GenesisABI.abi, provider);
    
    const stats = await contract.stats();
    
    return {
      totalProjects: stats.totalProjects.toNumber(),
      totalBacking: stats.totalBacking.toNumber(),
      totalDonations: ethers.utils.formatEther(stats.totalDonations)
    };
  } catch (error) {
    console.error("Lỗi lấy contract stats:", error);
    return null;
  }
}
