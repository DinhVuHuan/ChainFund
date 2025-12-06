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
  
  // Đảm bảo thư mục tồn tại trước khi ghi file
  const dir = './src/abis';
  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFile('./src/abis/contractAddress.json', address, 'utf8', (err) => {
    if (err) {
      console.error(err)
      return
    }
    console.log('Deploy thành công! Địa chỉ:', contract.address)
  })
}

// 5. Thêm đoạn này để chạy hàm main (Code cũ của bạn thiếu đoạn này nên nó không chạy đâu)
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });