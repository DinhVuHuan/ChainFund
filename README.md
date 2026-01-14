
# ChainFund — README

**Overview:**
ChainFund là một ứng dụng Crowdfunding phi tập trung (DApp) gồm frontend React, hợp đồng thông minh Solidity (Hardhat) và Supabase cho dữ liệu ngoài-chain.

**Files chính**
- Frontend: [src](src) (ví dụ: [src/views/CreateProjects.jsx](src/views/CreateProjects.jsx)).
- Smart contract: [contracts/Genesis.sol](contracts/Genesis.sol).
- ABI & addresses: [src/abis](src/abis/).
- Deploy script: [scripts/deploy.js](scripts/deploy.js).
- Báo cáo dự án: [REPORT.md](REPORT.md).

## Yêu cầu (Prerequisites)
- Node.js (v14+)
- npm
- npx (đi kèm Node.js)
- Hardhat (sử dụng qua `npx hardhat`)

## Chạy local (development)

1. Cài dependencies

```bash
npm install
```

2. Khởi động local blockchain

```bash
npx hardhat node
```

3. Triển khai hợp đồng lên node local

```bash
npx hardhat run --network localhost scripts/deploy.js
```

Script triển khai sẽ compile contract và ghi địa chỉ contract vào `src/abis/contractAddress.json`.

4. Chạy frontend

```bash
npm start
```

Mở trình duyệt: http://localhost:3000

## Triển khai lên Testnet (Sepolia)

1. Thiết lập biến môi trường (ví dụ `.env`) chứa RPC URL và PRIVATE_KEY (không commit file này):

```
SEPOLIA_URL=https://...
PRIVATE_KEY=0x...
```

2. Tham khảo `DEPLOY_SEPOLIA.md` cho hướng dẫn chi tiết; chạy:

```bash
npx hardhat run --network sepolia scripts/deploy.js
```

## Build production

```bash
npm run build
```

Thư mục build sẽ nằm ở `build/` có thể triển khai lên static host.

## Cấu trúc chức năng (tóm tắt)
- Tạo dự án: frontend gọi contract để tạo campaign và lưu metadata lên Supabase.
- Xem & lọc danh sách dự án: frontend lấy data từ Supabase và/hoặc events on-chain.
- Donate: thực hiện giao dịch on-chain đến contract; sau khi confirm, ghi record lên Supabase.

## Tài nguyên & vị trí code quan trọng
- Contract: [contracts/Genesis.sol](contracts/Genesis.sol)
- ABI & contract address: [src/abis](src/abis/)
- Kết nối blockchain frontend: [src/services/blockchain.js](src/services/blockchain.js)
- Supabase clients: [src/services/supabaseClients.js](src/services/supabaseClients.js)
- Deploy scripts: [scripts/deploy.js](scripts/deploy.js)

## Lưu ý bảo mật
- Không commit private keys hay `.env` chứa secrets.
- Kiểm thử contract kỹ lưỡng trước khi deploy lên mainnet.

## Liên hệ
Nếu cần mở rộng, thêm unit tests hoặc sơ đồ kiến trúc, cho tôi biết để tôi hỗ trợ tiếp.

