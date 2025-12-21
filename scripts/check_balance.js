const { ethers } = require('hardhat')

async function main() {
  console.log('\n🔍 Checking account balance...\n')

  const [deployer] = await ethers.getSigners()
  const address = deployer.address
  const balance = await deployer.getBalance()
  const network = await ethers.provider.getNetwork()

  console.log('📍 Account:', address)
  console.log('🌐 Network:', network.name, `(chainId: ${network.chainId})`)
  console.log('💰 Balance:', ethers.utils.formatEther(balance), 'ETH')

  const minRequired = ethers.utils.parseEther('0.05')
  
  if (balance.gte(minRequired)) {
    console.log('✅ Sufficient balance to deploy!')
  } else {
    console.log('❌ Insufficient balance!')
    console.log(`   Need at least: 0.05 ETH`)
    console.log(`   Current: ${ethers.utils.formatEther(balance)} ETH`)
    console.log('\n💡 Get test ETH from:')
    console.log('   - https://sepoliafaucet.com/')
    console.log('   - https://www.alchemy.com/faucets/ethereum-sepolia')
    console.log('   - https://faucet.quicknode.com/ethereum/sepolia')
  }

  console.log('')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
