import { ethers } from 'ethers'
import { supabase } from './supabaseClients' 
import GenesisABI from '../abis/src/contracts/Genesis.sol/Genesis.json' 

// Điền địa chỉ Contract bạn đã deploy
const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; 

// --- HÀM 1: LOGIN ---
export const connectWallet = async () => {
  try {
    if (!window.ethereum) return alert("Cài MetaMask đi bạn!");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const lowerAddress = address.toLowerCase();

    console.log("Đã kết nối ví:", lowerAddress);

    // Check user trong Supabase
    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('address', lowerAddress)
      .single();

    if (!user) {
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{ address: lowerAddress }])
        .select()
        .single();
      
      if (error) throw error;
      user = newUser;
    }

    const message = `Welcome! Please sign this nonce: ${user.nonce}`;
    const signature = await signer.signMessage(message);
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    
    if (recoveredAddress.toLowerCase() === lowerAddress) {
        // Đổi nonce mới bảo mật
        await supabase
          .from('users')
          .update({ nonce: Math.floor(Math.random() * 1000000).toString() })
          .eq('address', lowerAddress);

        return lowerAddress; 
    } else {
        alert("Chữ ký sai!");
        return null;
    }

  } catch (error) {
    console.error("Lỗi login:", error);
    alert("Lỗi đăng nhập (Xem console)");
    return null;
  }
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
          backer_address: address.toLowerCase(),
          amount: ethAmount,
          project_id: projectId
        }
      ]);

    if (error) throw error;

    alert("Donate thành công!");
    window.location.reload();

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
