# 🚀 Quick Deploy Guide

## Deploy lên Sepolia Testnet trong 3 bước:

### 1. Thêm Private Key vào .env
\`\`\`bash
# Mở file .env và thêm:
PRIVATE_KEY=your_private_key_without_0x_prefix
\`\`\`

### 2. Kiểm tra Balance
\`\`\`bash
npx hardhat run scripts/check_balance.js --network sepolia
\`\`\`

Cần ít nhất **0.05 ETH**. Lấy miễn phí tại: https://sepoliafaucet.com/

### 3. Deploy!
\`\`\`bash
npx hardhat run scripts/deploy.js --network sepolia
\`\`\`

**✅ Xong! Contract đã được deploy lên Sepolia!**

---

## 📖 Hướng dẫn chi tiết

Xem file: [DEPLOY_SEPOLIA.md](DEPLOY_SEPOLIA.md)

---

## ⚡ Commands

\`\`\`bash
# Compile contract
npx hardhat compile

# Deploy to localhost
npx hardhat run scripts/deploy.js --network localhost

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Check balance
npx hardhat run scripts/check_balance.js --network sepolia
\`\`\`

---

## 🔗 Useful Links

- **QuickNode Dashboard:** https://dashboard.quicknode.com/
- **Sepolia Faucet:** https://sepoliafaucet.com/
- **Sepolia Etherscan:** https://sepolia.etherscan.io/
- **MetaMask:** https://metamask.io/

---

## ⚠️ QUAN TRỌNG

- ❌ **KHÔNG** commit file `.env` lên Git!
- ❌ **KHÔNG** share private key với ai!
- ✅ Chỉ dùng test wallet cho testnet
- ✅ Test kỹ trên testnet trước khi lên mainnet
