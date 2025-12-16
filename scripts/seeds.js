const { ethers } = require('hardhat');

async function main() {
  // Thay bằng địa chỉ Contract CỦA BẠN (Lấy trong blockchain.js)
  const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; 

  const Contract = await ethers.getContractFactory('Genesis');
  const contract = Contract.attach(contractAddress);

  console.log("⏳ Đang tạo dự án mẫu...");

  // Tạo dự án: Tiêu đề, Mô tả, Ảnh, Mục tiêu 10 ETH, Hết hạn sau 10 ngày
  const tx = await contract.createProject(
      "Du an dau tien", 
      "Mo ta du an", 
      "https://via.placeholder.com/300", 
      ethers.utils.parseEther("10"), 
      Math.floor(Date.now() / 1000) + 864000 
  );

  await tx.wait();
  console.log("✅ Đã tạo thành công Project ID: 0");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });