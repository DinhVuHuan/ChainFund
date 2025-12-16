# ChainFund - Quick Start Guide

## 5 Bước để bắt đầu

### 1️⃣ Setup Supabase Database (5 phút)

```bash
# Copy toàn bộ code từ DATABASE_SETUP.sql
# Vào Supabase Console → SQL Editor → Paste → Run

# Tables sẽ được tạo:
# - users (quản lý users & admin status)
# - campaigns (thông tin campaigns)
# - donations (lịch sử donations)
```

### 2️⃣ Configure Admin Address (2 phút)

Mở `src/config/appConfig.js`:

```javascript
export const ADMIN_ADDRESSES = [
  "0xYourAdminWalletAddress", // Replace với address admin của bạn
];
```

### 3️⃣ Start Dev Server (1 phút)

```bash
npm start
# App sẽ mở tại http://localhost:3000
```

### 4️⃣ Connect Wallet (1 phút)

- Mở app
- Click "Connect Wallet"
- MetaMask sẽ popup
- Chọn ví admin
- Confirm signature

### 5️⃣ Test Create Campaign (2 phút)

- Go to "Create Campaign"
- Fill in form:
  - Title: "Test Campaign"
  - Description: "This is a test"
  - Target: 1 ETH
  - Duration: 30 days
  - Image: (optional)
- Click "Create Campaign"
- MetaMask sẽ popup - Confirm
- Check Supabase → campaigns table để verify

---

## 🎯 Các Tính Năng Chính

### Campaign Management
```javascript
// Tạo campaign
import { createCampaign } from './services/campaignAPI'
await createCampaign(walletAddress, campaignData)

// Lấy campaigns
import { listCampaigns } from './services/campaignAPI'
const campaigns = await listCampaigns()

// Cập nhật campaign
import { updateCampaign } from './services/campaignAPI'
await updateCampaign(projectId, newData)

// Xóa campaign
import { deleteCampaign } from './services/campaignAPI'
await deleteCampaign(projectId)
```

### Donation Management
```javascript
// Donate
import { donateToCampaign } from './services/donationAPI'
await donateToCampaign(projectId, ethAmount, walletAddress)

// Get donations
import { getDonationsByProject } from './services/donationAPI'
const donations = await getDonationsByProject(projectId)

// Get donor stats
import { getTopDonors, getDonationStats } from './services/donationAPI'
const topDonors = await getTopDonors(10)
const stats = await getDonationStats()
```

### Blockchain Integration
```javascript
// Connect wallet
import { connectWallet } from './services/blockchain'
const address = await connectWallet()

// Get balance
import { getWalletBalance } from './services/blockchain'
const balance = await getWalletBalance(address)

// Get project data
import { getProjectFromBlockchain } from './services/blockchain'
const project = await getProjectFromBlockchain(projectId)
```

---

## 🔧 File Structure

```
ChainFund-main/
├── src/
│   ├── services/
│   │   ├── campaignAPI.js      ✅ NEW - Campaign operations
│   │   ├── donationAPI.js      ✅ NEW - Donation operations
│   │   ├── blockchain.js       ✅ UPDATED - Wallet & blockchain
│   │   └── supabaseClients.js  - Supabase config
│   ├── config/
│   │   └── appConfig.js        ✅ NEW - Centralized config
│   ├── context/
│   │   └── ProjectContext.jsx  ✅ UPDATED - Supabase integration
│   ├── views/
│   │   └── CreateProjects.jsx  ✅ UPDATED - Admin check
│   ├── components/
│   │   └── ExampleComponents.jsx ✅ NEW - Example code
│   └── ...
├── DATABASE_SETUP.sql           ✅ NEW - Supabase tables
├── IMPLEMENTATION_GUIDE.md      ✅ NEW - Full API docs
├── SETUP_CHECKLIST.md           ✅ NEW - Complete checklist
└── QUICK_START.md               ✅ NEW - This file
```

---

## ⚡ Common Issues & Solutions

### Problem: "Chỉ admin mới có thể tạo campaign"
**Solution**: Đảm bảo đang dùng admin wallet address từ `appConfig.js`

### Problem: "Supabase connection failed"
**Solution**: 
1. Kiểm tra `src/services/supabaseClients.js`
2. Verify Supabase URL & key
3. Kiểm tra Tables đã được tạo chưa

### Problem: "Contract not found"
**Solution**:
1. Verify contract address ở `appConfig.js`
2. Kiểm tra contract đã deploy chưa
3. Verify network selection ở MetaMask

### Problem: "Campaign not saving to Supabase"
**Solution**:
1. Check browser console (F12)
2. Verify tables exist: Supabase → Table Editor
3. Check Supabase permissions
4. Verify row-level security (if enabled)

### Problem: "Transaction fails"
**Solution**:
1. Check wallet balance
2. Verify gas limit in `appConfig.js`
3. Check network congestion
4. Try increasing gas price

---

## 📚 Quick API Reference

### Campaign API
```javascript
createCampaign(address, data)          // Create campaign
listCampaigns(status?)                 // List all campaigns
getCampaignById(projectId)             // Get one campaign
getCampaignsByOwner(address)           // Get user's campaigns
checkCampaignStatus(projectId)         // Get campaign status
updateCampaign(projectId, data)        // Update campaign
deleteCampaign(projectId)              // Delete campaign
getCampaignStats()                     // Get statistics
```

### Donation API
```javascript
donateToCampaign(projectId, amount, address)    // Donate
getTotalDonationByProject(projectId)            // Get total
getDonationsByProject(projectId, limit, offset) // Get list
getDonationsByDonor(address, limit, offset)    // Get user donations
getDonorCountByProject(projectId)              // Count donors
getTotalDonatedByUser(address)                 // User total donated
getTopDonors(limit)                            // Leaderboard
getDonationStats()                             // Statistics
```

### Blockchain API
```javascript
connectWallet()                        // Connect MetaMask
checkIfAdmin(address)                  // Check admin
getUserInfo(address)                   // Get user data
getWalletBalance(address)              // Get ETH balance
getContractBalance()                   // Get contract balance
getProjectFromBlockchain(projectId)    // Get project
getAllProjectsFromBlockchain()         // Get all projects
getBackersOfProject(projectId)         // Get backers
getContractStats()                     // Get stats
```

---

## 🎓 Example: Building a Component

```jsx
import React, { useState, useEffect } from 'react'
import { useProjectContext } from '../context/ProjectContext'
import { 
  donateToCampaign, 
  getDonationsByProject 
} from '../services/donationAPI'

export const CampaignPage = ({ projectId }) => {
  const { currentAccount } = useProjectContext()
  const [donations, setDonations] = useState([])
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  // Load donations on mount
  useEffect(() => {
    const load = async () => {
      const data = await getDonationsByProject(projectId)
      setDonations(data)
    }
    load()
  }, [projectId])

  // Handle donation
  const handleDonate = async () => {
    setLoading(true)
    try {
      await donateToCampaign(projectId, amount, currentAccount)
      alert('Donated successfully!')
      
      // Refresh donations
      const updated = await getDonationsByProject(projectId)
      setDonations(updated)
      setAmount('')
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Campaign #{projectId}</h2>
      
      {/* Donate Form */}
      <div>
        <input 
          type="number" 
          value={amount} 
          onChange={e => setAmount(e.target.value)}
          placeholder="Amount in ETH"
        />
        <button onClick={handleDonate} disabled={loading}>
          {loading ? 'Processing...' : 'Donate'}
        </button>
      </div>

      {/* Recent Donations */}
      <div>
        <h3>Recent Supporters</h3>
        {donations.map(d => (
          <div key={d.id}>
            <p>{d.donor_address}: {d.amount_eth} ETH</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Test all features locally
- [ ] Update admin addresses
- [ ] Verify Supabase tables
- [ ] Test on testnet (Sepolia)
- [ ] Get security audit
- [ ] Deploy to mainnet
- [ ] Monitor for issues

---

## 📖 Full Documentation

For complete API reference and examples:
- Read `IMPLEMENTATION_GUIDE.md` - Full API docs
- Check `SETUP_CHECKLIST.md` - Detailed checklist
- See `ExampleComponents.jsx` - Working examples

---

## 🆘 Need Help?

1. Check `IMPLEMENTATION_GUIDE.md` for API docs
2. See `ExampleComponents.jsx` for working code
3. Review browser console (F12) for errors
4. Check Supabase logs
5. Verify contract deployment

---

## ✨ What You Can Do Now

✅ Create campaigns (admin only)
✅ View all campaigns
✅ Donate to campaigns
✅ View donation history
✅ See top donors
✅ Track campaign progress
✅ Update/delete campaigns (admin)
✅ Get blockchain data

Happy building! 🚀
