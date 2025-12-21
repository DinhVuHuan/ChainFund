const { ethers } = require('hardhat')
const fs = require('fs')

async function main() {
  // 1. Điền đúng tên Contract (Phải khớp với chữ 'contract Genesis' trong file .sol)
  const contract_name = 'Genesis' 
  
  // 2. Định nghĩa phí thuế (Vì constructor của bạn yêu cầu tham số _projectTax)
  const taxFee = 5; // Ví dụ: 5%

  console.log(`Đang deploy contract ${contract_name} với thuế ${taxFee}% ...`);

  const Contract = await ethers.getContractFactory(contract_name)
  
  // 3. Truyền tham số taxFee vào hàm deploy
  const contract = await Contract.deploy(taxFee)

  await contract.deployed()

  // 4. Lưu địa chỉ vào file JSON để React dùng
  const address = JSON.stringify({ address: contract.address }, null, 4)
  const path = require('path');
  const outDir = path.resolve(__dirname, '..', 'src', 'abis');
  if (!fs.existsSync(outDir)){
      fs.mkdirSync(outDir, { recursive: true });
  }
  const outPath = path.resolve(outDir, 'contractAddress.json');
  // Use synchronous write to ensure file is written before process exit
  try {
    fs.writeFileSync(outPath, address, 'utf8')
    console.log('Deploy thành công! Wrote', outPath)
  } catch (err) {
    console.error('Lỗi khi ghi file địa chỉ hợp đồng:', err)
    throw err
  }
}

// 5. Thêm đoạn này để chạy hàm main (Code cũ của bạn thiếu đoạn này nên nó không chạy đâu)
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });