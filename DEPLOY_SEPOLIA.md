# 🚀 Hướng dẫn Deploy lên Sepolia Testnet

## 📋 Chuẩn bị

### 1. Cài đặt MetaMask
- Tải extension MetaMask cho browser
- Tạo hoặc import ví

### 2. Lấy Sepolia ETH miễn phí
Truy cập các faucet sau để lấy test ETH:
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia
- https://faucet.quicknode.com/ethereum/sepolia

**Cần ít nhất 0.05 ETH để deploy contract**

### 3. Lấy Private Key từ MetaMask
⚠️ **CẢNH BÁO: KHÔNG BAO GIỜ CHIA SẺ PRIVATE KEY!**

1. Mở MetaMask
2. Click vào account avatar → Account Details
3. Click "Export Private Key"
4. Nhập password MetaMask
5. Copy private key (bỏ prefix `0x` nếu có)

---

## 🔧 Cấu hình

### 1. Cập nhật file .env

Mở file `.env` và điền thông tin:

\`\`\`bash
# Private key (BỎ prefix 0x)
PRIVATE_KEY=your_private_key_here_without_0x

# QuickNode Sepolia endpoint (đã có sẵn)
QUICKNODE_URL=https://palpable-proud-sailboat.ethereum-sepolia.quiknode.pro/f639e72b7e1245a588d25e3b3c07bb46faac0d12/

# Contract address (sẽ tự động update sau khi deploy)
REACT_APP_CONTRACT_ADDRESS=
REACT_APP_RPC_URL=https://palpable-proud-sailboat.ethereum-sepolia.quiknode.pro/f639e72b7e1245a588d25e3b3c07bb46faac0d12/
REACT_APP_NETWORK=sepolia
REACT_APP_CHAIN_ID=11155111
\`\`\`

### 2. Kiểm tra balance

\`\`\`bash
# Kiểm tra xem ví có đủ ETH không
npx hardhat run scripts/check_balance.js --network sepolia
\`\`\`

---

## 🚀 Deploy Contract

### Deploy lên Sepolia

\`\`\`bash
npx hardhat run scripts/deploy.js --network sepolia
\`\`\`

**Output mẫu:**
\`\`\`
🚀 Deploying to network: sepolia (chainId: 11155111)
📍 Deploying from account: 0x1234...5678
💰 Account balance: 0.1 ETH

⏳ Deploying Genesis contract with 5% tax...
📝 Transaction hash: 0xabc...def
⏳ Waiting for confirmation...

✅ Contract deployed successfully!
📍 Contract address: 0x9876...4321
🔗 View on Etherscan: https://sepolia.etherscan.io/address/0x9876...4321

📝 Contract info saved to: src/abis/contractAddress.json
📝 Updated .env with contract address

🎉 Deployment complete!
\`\`\`

### Xác minh trên Etherscan

1. Mở link Etherscan từ output
2. Xem transaction deploy
3. Kiểm tra contract address

---

## 🔄 Cập nhật Frontend

### 1. Restart React App

\`\`\`bash
npm start
\`\`\`

App sẽ tự động load contract address mới từ `contractAddress.json`

### 2. Kết nối MetaMask

1. Mở app trên browser
2. Đảm bảo MetaMask đang ở **Sepolia network**
3. Click "Connect Wallet"
4. Approve connection

### 3. Thêm Sepolia Network vào MetaMask (nếu chưa có)

**Network Details:**
- **Network Name:** Sepolia Test Network
- **RPC URL:** https://palpable-proud-sailboat.ethereum-sepolia.quiknode.pro/f639e72b7e1245a588d25e3b3c07bb46faac0d12/
- **Chain ID:** 11155111
- **Currency Symbol:** SepoliaETH
- **Block Explorer:** https://sepolia.etherscan.io

---

## ✅ Kiểm tra Deploy thành công

### 1. Kiểm tra file contractAddress.json

\`\`\`bash
cat src/abis/contractAddress.json
\`\`\`

**Output mẫu:**
\`\`\`json
{
  "address": "0x9876...4321",
  "network": "sepolia",
  "chainId": 11155111,
  "deployedAt": "2025-12-21T10:30:00.000Z",
  "taxFee": 5,
  "deployer": "0x1234...5678",
  "transactionHash": "0xabc...def"
}
\`\`\`

### 2. Test tương tác với contract

Mở console browser (F12) và chạy:

\`\`\`javascript
// Check contract address
console.log('Contract:', window.ethereum.selectedAddress)

// Try reading from contract
const provider = new ethers.providers.Web3Provider(window.ethereum)
const contract = new ethers.Contract(
  'YOUR_CONTRACT_ADDRESS',
  ABI,
  provider
)

const stats = await contract.stats()
console.log('Stats:', stats)
\`\`\`

---

## 🐛 Troubleshooting

### Lỗi: "insufficient funds"
**Giải pháp:** Lấy thêm Sepolia ETH từ faucet

### Lỗi: "PRIVATE_KEY not set"
**Giải pháp:** Kiểm tra file `.env` có đúng format không

\`\`\`bash
# SAI ❌
PRIVATE_KEY=0xabc123...

# ĐÚNG ✅
PRIVATE_KEY=abc123...
\`\`\`

### Lỗi: "nonce too high"
**Giải pháp:** Reset MetaMask
1. Settings → Advanced
2. Clear Activity Tab Data

### Lỗi: "cannot estimate gas"
**Giải pháp:** 
- Kiểm tra contract code có lỗi không
- Compile lại: \`npx hardhat compile\`
- Kiểm tra RPC URL có hoạt động không

### Contract không hiển thị trên app
**Giải pháp:**
1. Kiểm tra file \`.env\` đã update contract address chưa
2. Restart React app: \`npm start\`
3. Clear browser cache (Ctrl+Shift+R)
4. Kiểm tra MetaMask đang ở đúng network (Sepolia)

---

## 📊 So sánh Local vs Sepolia

| Feature | Local (Hardhat) | Sepolia Testnet |
|---------|-----------------|-----------------|
| Deploy time | < 1 giây | 15-30 giây |
| Cost | Miễn phí | Miễn phí (test ETH) |
| Data persistence | ❌ Mất khi restart | ✅ Vĩnh viễn |
| Public access | ❌ Chỉ local | ✅ Ai cũng truy cập được |
| Debugging | ✅ Dễ dàng | ⚠️ Khó hơn |
| Reset database | ⚠️ Cần khi restart | ❌ Không cần |

---

## 🎯 Next Steps

### Deploy lên Mainnet
⚠️ **CHỈ KHI ĐÃ TEST KỸ TRÊN TESTNET!**

1. Chuẩn bị real ETH (cần ~$50-100 cho gas)
2. Update \`hardhat.config.js\` với mainnet config
3. Deploy: \`npx hardhat run scripts/deploy.js --network mainnet\`
4. Verify contract trên Etherscan

### Verify Contract Code trên Etherscan
Để người dùng có thể đọc source code:

\`\`\`bash
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS 5
\`\`\`

(5 là tham số taxFee)

---

## 🔐 Bảo mật

### ✅ DO:
- ✅ Sử dụng test wallet cho testnet
- ✅ Giữ private key trong \`.env\`
- ✅ Thêm \`.env\` vào \`.gitignore\`
- ✅ Test kỹ trên testnet trước khi lên mainnet

### ❌ DON'T:
- ❌ KHÔNG commit \`.env\` lên Git
- ❌ KHÔNG share private key
- ❌ KHÔNG dùng wallet thật cho testnet
- ❌ KHÔNG deploy thẳng lên mainnet mà chưa test

---

## 📞 Support

Có vấn đề? Check:
1. [Etherscan Sepolia](https://sepolia.etherscan.io/) - Xem transaction
2. [QuickNode Dashboard](https://dashboard.quicknode.com/) - Xem API usage
3. [Hardhat Docs](https://hardhat.org/docs) - Tài liệu Hardhat

---

**Last Updated:** 2025-12-21
