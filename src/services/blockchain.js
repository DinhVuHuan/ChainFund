import { ethers } from 'ethers'
import { supabase } from './supabaseClients' 
import GenesisABI from '../abis/src/contracts/Genesis.sol/Genesis.json'
import { CONTRACT_CONFIG } from '../config/appConfig'

const contractAddress = CONTRACT_CONFIG.address 

// --- HÀM 1: LOGIN ---
export const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      alert("Cài MetaMask đi bạn!");
      return null;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
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
    const provider = new ethers.providers.Web3Provider(window.ethereum)
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
    const provider = new ethers.providers.Web3Provider(window.ethereum)
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

    // 1. Gửi tiền trên Blockchain
    const parsedAmount = ethers.utils.parseEther(ethAmount.toString());
    
    // --- SỬA Ở ĐÂY: Thêm gasLimit thủ công ---
    const tx = await contract.backProject(projectId, { 
        value: parsedAmount,
        gasLimit: 500000 // Ép buộc dùng 500k gas (dư sức chạy)
    });
    
    console.log("Đang chờ xác nhận...", tx.hash);
    await tx.wait(); 

    // 2. Lưu vào Supabase
    const { error } = await supabase
      .from('donations')
      .insert([
        {
          donor_address: address.toLowerCase(),
          amount_eth: ethAmount,
          project_id: projectId,
          transaction_hash: tx.hash,
          status: 'CONFIRMED'
        }
      ]);

    if (error) throw error;

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
      .eq('backer_address', userAddress.toLowerCase())
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
      backers: project.backers.toNumber(),
      status: ['OPEN', 'APPROVED', 'REVERTED', 'DELETED', 'PAIDOUT'][project.status]
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
    
    return projects.map((p, idx) => ({
      id: idx,
      owner: p.owner,
      title: p.title,
      description: p.description,
      imageURL: p.imageURL,
      cost: ethers.utils.formatEther(p.cost),
      raised: ethers.utils.formatEther(p.raised),
      timestamp: new Date(p.timestamp * 1000),
      expiresAt: new Date(p.expiresAt * 1000),
      backers: p.backers.toNumber(),
      status: ['OPEN', 'APPROVED', 'REVERTED', 'DELETED', 'PAIDOUT'][p.status]
    }));
  } catch (error) {
    console.error("Lỗi lấy tất cả projects:", error);
    return [];
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
