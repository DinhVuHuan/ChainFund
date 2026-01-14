const { ethers } = require('hardhat')
const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

// Helper: safe fetch (Node 18+ has global fetch)
let _fetch = global.fetch
if (typeof _fetch !== 'function') {
  try {
    _fetch = require('node-fetch')
  } catch (e) {
    _fetch = null
  }
}

// NOTE: DB cleanup is now performed by the standalone script `scripts/clean_db.js`.

async function main() {
  // Deployment will auto-run DB cleanup for local networks (localhost/hardhat) or when CLEAR_DB env var set.

  // 1. Get network info
  const network = await ethers.provider.getNetwork()
  console.log(`\n🚀 Deploying to network: ${network.name} (chainId: ${network.chainId})`)
  // DB cleanup will be handled after deployment by running `scripts/clean_db.js` when appropriate.

  // 2. Get deployer account
  const [deployer] = await ethers.getSigners()
  console.log(`📍 Deploying from account: ${deployer.address}`)
  
  const balance = await deployer.getBalance()
  console.log(`💰 Account balance: ${ethers.utils.formatEther(balance)} ETH`)

  if (balance.eq(0)) {
    throw new Error('❌ Account has no ETH! Please fund your account first.')
  }

  // 3. Contract config
  const contract_name = 'Genesis'
  const taxFee = 5 // 5% tax

  console.log(`\n⏳ Deploying ${contract_name} contract with ${taxFee}% tax...`)

  // 4. Deploy contract
  const Contract = await ethers.getContractFactory(contract_name)
  const contract = await Contract.deploy(taxFee)

  console.log(`📝 Transaction hash: ${contract.deployTransaction.hash}`)
  console.log(`⏳ Waiting for confirmation...`)

  await contract.deployed()

  console.log(`\n✅ Contract deployed successfully!`)
  console.log(`📍 Contract address: ${contract.address}`)
  console.log(`🔗 View on Etherscan: https://${network.name === 'sepolia' ? 'sepolia.' : ''}etherscan.io/address/${contract.address}`)

  // 5. Save address to file
  const addressData = {
    address: contract.address,
    network: network.name,
    chainId: network.chainId,
    deployedAt: new Date().toISOString(),
    taxFee: taxFee,
    deployer: deployer.address,
    transactionHash: contract.deployTransaction.hash
  }

  const outDir = path.resolve(__dirname, '..', 'src', 'abis')
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }
  const outPath = path.resolve(outDir, 'contractAddress.json')

  try {
    fs.writeFileSync(outPath, JSON.stringify(addressData, null, 2), 'utf8')
    console.log(`\n📝 Contract info saved to: ${outPath}`)
  } catch (err) {
    console.error('❌ Error writing contract address file:', err)
    throw err
  }

  // 6. Update .env file
  try {
    const envPath = path.resolve(__dirname, '..', '.env')
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : ''
    
    // Update or add REACT_APP_CONTRACT_ADDRESS
    if (envContent.includes('REACT_APP_CONTRACT_ADDRESS=')) {
      envContent = envContent.replace(
        /REACT_APP_CONTRACT_ADDRESS=.*/,
        `REACT_APP_CONTRACT_ADDRESS=${contract.address}`
      )
    } else {
      envContent += `\nREACT_APP_CONTRACT_ADDRESS=${contract.address}\n`
    }

    fs.writeFileSync(envPath, envContent, 'utf8')
    console.log(`📝 Updated .env with contract address`)
  } catch (err) {
    console.warn('⚠️  Could not update .env file:', err.message)
  }

  console.log(`\n🎉 Deployment complete!\n`)

  // Conditionally run the standalone cleaner after a successful deploy.
  try {
    const doClear = (process.env.CLEAR_DB === 'true') || (process.env.CLEAR_DB === '1')
    const localNetworks = ['localhost', 'hardhat']
    const networkNameLower = (network.name || '').toLowerCase()
    const localChainIds = [31337, 1337]
    const isLocalEnv = localNetworks.includes(networkNameLower)
      || (network && network.chainId && localChainIds.includes(Number(network.chainId)))
      || process.env.CLEAR_DB_ALWAYS === 'true'
      || ['localhost', 'hardhat'].includes((process.env.HARDHAT_NETWORK || '').toLowerCase())

    if (doClear || isLocalEnv) {
      console.log('🔁 Auto-running scripts/clean_db.js --force')
      const scriptPath = path.resolve(__dirname, 'clean_db.js')
      const res = spawnSync(process.execPath, [scriptPath, '--force'], { stdio: 'inherit', cwd: path.resolve(__dirname) })
      if (res.error) {
        console.warn('Failed to launch clean_db.js:', res.error)
      } else if (res.status !== 0) {
        console.warn('clean_db.js exited with non-zero status:', res.status)
      } else {
        console.log('🔁 Clean script finished.')
      }
    } else {
      console.log('ℹ️  Skipping auto DB clean (not local and CLEAR_DB not set).')
    }
  } catch (e) {
    console.warn('Post-deploy cleanup runner failed:', e.message || e)
  }
}

// 5. Thêm đoạn này để chạy hàm main (Code cũ của bạn thiếu đoạn này nên nó không chạy đâu)
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });