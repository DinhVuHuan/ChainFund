# ChainFund - Setup Guide

## Tổng Quan Dự Án

ChainFund là một ứng dụng crowdfunding phi tập trung dựa trên blockchain (Ethereum/Hardhat) + Supabase + React.

Bạn vừa implement:
1. **Campaign API** - Quản lý campaigns (tạo, cập nhật, xóa, liệt kê)
2. **Donation API** - Quản lý donations (donate, lịch sử, thống kê)
3. **Blockchain Integration** - Kết nối với smart contract Genesis
4. **Supabase Integration** - Lưu & lấy dữ liệu từ database

---

## Cấu Trúc Thư Mục

```
src/
├── services/
│   ├── blockchain.js       ✅ (Cập nhật) - Wallet & blockchain functions
│   ├── campaignAPI.js      ✅ (Mới) - Campaign operations
│   ├── donationAPI.js      ✅ (Mới) - Donation operations
│   └── supabaseClients.js  - Supabase config
├── context/
│   └── ProjectContext.jsx  ✅ (Cập nhật) - Global state with Supabase
├── views/
│   └── CreateProjects.jsx  ✅ (Cập nhật) - Form + Admin check
└── ...
```

---

## Setup Database (Supabase)

### 1. Tạo Tables

1. Vào [Supabase Console](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **SQL Editor**
4. Copy toàn bộ code từ `DATABASE_SETUP.sql` vào SQL Editor
5. Nhấn **Run**

Điều này sẽ tạo 3 tables:
- `users` - Lưu user accounts + nonce
- `campaigns` - Lưu campaigns info
- `donations` - Lưu donation records

### 2. Update Admin Address

Mở `src/services/campaignAPI.js` tìm dòng:
```javascript
const ADMIN_ADDRESS = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266" // Replace với address thật
```

Thay bằng địa chỉ ví admin của bạn.

### 3. Kiểm tra Supabase Config

Mở `src/services/supabaseClients.js` và đảm bảo có:
- `supabaseUrl` - URL của Supabase project
- `supabaseKey` - Publishable key

---

## API References

### Campaign API (`campaignAPI.js`)

#### Tạo campaign
```javascript
import { createCampaign } from '../services/campaignAPI'

const campaign = await createCampaign(walletAddress, {
  title: "Help Build a Well",
  description: "Support clean water project",
  target: "10", // ETH
  duration: "30", // days
  image: "https://..." // optional
})
```

#### Lấy tất cả campaigns
```javascript
import { listCampaigns } from '../services/campaignAPI'

const campaigns = await listCampaigns() // Tất cả
const activeCampaigns = await listCampaigns('OPEN') // Chỉ OPEN
```

#### Lấy campaigns của user
```javascript
import { getCampaignsByOwner } from '../services/campaignAPI'

const myCampaigns = await getCampaignsByOwner(walletAddress)
```

#### Kiểm tra campaign status
```javascript
import { checkCampaignStatus } from '../services/campaignAPI'

const status = await checkCampaignStatus(projectId)
// Returns: { status, raised, cost, backers, expiresAt, dbStatus }
```

#### Cập nhật campaign
```javascript
import { updateCampaign } from '../services/campaignAPI'

await updateCampaign(projectId, {
  title: "New Title",
  description: "New Description",
  image: "https://...",
  duration: "40"
})
```

#### Xóa campaign
```javascript
import { deleteCampaign } from '../services/campaignAPI'

await deleteCampaign(projectId)
```

#### Lấy statistics
```javascript
import { getCampaignStats } from '../services/campaignAPI'

const stats = await getCampaignStats()
// Returns: { totalCampaigns, activeCampaigns, totalRaised, totalDonators, successfulCampaigns }
```

---

### Donation API (`donationAPI.js`)

#### Donate cho campaign
```javascript
import { donateToCampaign } from '../services/donationAPI'

const donation = await donateToCampaign(projectId, ethAmount, walletAddress)
```

#### Lấy tổng donation của campaign
```javascript
import { getTotalDonationByProject } from '../services/donationAPI'

const total = await getTotalDonationByProject(projectId) // ETH
```

#### Lấy danh sách donors của campaign
```javascript
import { getDonationsByProject } from '../services/donationAPI'

const donations = await getDonationsByProject(projectId, limit = 50, offset = 0)
```

#### Lấy lịch sử donation của user
```javascript
import { getDonationsByDonor } from '../services/donationAPI'

const myDonations = await getDonationsByDonor(walletAddress)
```

#### Lấy top donors
```javascript
import { getTopDonors } from '../services/donationAPI'

const topDonors = await getTopDonors(limit = 10)
// Returns: [{ address, totalDonated }, ...]
```

#### Lấy donation statistics
```javascript
import { getDonationStats } from '../services/donationAPI'

const stats = await getDonationStats()
// Returns: { totalDonations, totalAmount, avgDonation, uniqueDonors }
```

---

### Blockchain Functions (`blockchain.js`)

#### Kết nối ví
```javascript
import { connectWallet } from '../services/blockchain'

const address = await connectWallet()
```

#### Kiểm tra admin
```javascript
import { checkIfAdmin } from '../services/blockchain'

const isAdmin = await checkIfAdmin(walletAddress)
```

#### Lấy wallet balance
```javascript
import { getWalletBalance } from '../services/blockchain'

const balance = await getWalletBalance(walletAddress) // ETH
```

#### Lấy contract balance
```javascript
import { getContractBalance } from '../services/blockchain'

const contractBalance = await getContractBalance() // ETH
```

#### Lấy project từ blockchain
```javascript
import { getProjectFromBlockchain } from '../services/blockchain'

const project = await getProjectFromBlockchain(projectId)
```

#### Lấy tất cả projects từ blockchain
```javascript
import { getAllProjectsFromBlockchain } from '../services/blockchain'

const projects = await getAllProjectsFromBlockchain()
```

#### Lấy backers của project
```javascript
import { getBackersOfProject } from '../services/blockchain'

const backers = await getBackersOfProject(projectId)
```

---

## Tích Hợp vào Components

### Ví dụ: DonatePage.jsx
```jsx
import { donateToCampaign } from '../services/donationAPI'
import { getDonationsByProject } from '../services/donationAPI'
import { useProjectContext } from '../context/ProjectContext'

export const DonatePage = () => {
  const { currentAccount } = useProjectContext()
  const [donations, setDonations] = useState([])
  const [amount, setAmount] = useState('')

  const handleDonate = async () => {
    try {
      await donateToCampaign(projectId, amount, currentAccount)
      // Refresh donations list
      const updated = await getDonationsByProject(projectId)
      setDonations(updated)
    } catch (error) {
      console.error('Donate failed:', error)
    }
  }

  useEffect(() => {
    const loadDonations = async () => {
      const data = await getDonationsByProject(projectId)
      setDonations(data)
    }
    loadDonations()
  }, [])

  return (
    <div>
      <input value={amount} onChange={e => setAmount(e.target.value)} />
      <button onClick={handleDonate}>Donate {amount} ETH</button>
      
      <div>
        {donations.map(d => (
          <p>{d.donor_address}: {d.amount_eth} ETH</p>
        ))}
      </div>
    </div>
  )
}
```

### Ví dụ: Projects.jsx
```jsx
import { listCampaigns } from '../services/campaignAPI'

export const Projects = () => {
  const [campaigns, setCampaigns] = useState([])

  useEffect(() => {
    const loadCampaigns = async () => {
      const data = await listCampaigns()
      setCampaigns(data)
    }
    loadCampaigns()
  }, [])

  return (
    <div>
      {campaigns.map(c => (
        <div key={c.id}>
          <h3>{c.title}</h3>
          <p>{c.description}</p>
          <p>Raised: {c.raised_amount} / {c.target_amount} ETH</p>
          <p>Status: {c.status}</p>
        </div>
      ))}
    </div>
  )
}
```

---

## Admin Features

### Kiểm tra Admin Status
```javascript
// Tự động check trong CreateProjects.jsx
const isAdmin = await checkIfAdmin(currentAccount)
```

### Set User as Admin (Supabase)
```sql
UPDATE users SET is_admin = TRUE WHERE address = '0x...'
```

---

## Blockchain Events

Contract Genesis emit events:
```solidity
event Action (
    uint256 id,
    string actionType,
    address indexed executor,
    uint256 timestamp
);
```

Action types:
- `PROJECT CREATED`
- `PROJECT UPDATED`
- `PROJECT DELETED`
- `PROJECT BACKED` (donation)
- `PROJECT PAID OUT`

---

## Troubleshooting

### Lỗi: "Chỉ admin mới có thể tạo campaign"
**Giải pháp**: 
1. Kiểm tra địa chỉ admin trong `campaignAPI.js`
2. Kiểm tra address user trong database có `is_admin = TRUE` không

### Lỗi: "Contract not found"
**Giải pháp**: 
1. Kiểm tra `contractAddress` trong `blockchain.js`
2. Kiểm tra contract đã deploy trên network không

### Lỗi: "Supabase connection failed"
**Giải pháp**:
1. Kiểm tra `supabaseUrl` và `supabaseKey` trong `supabaseClients.js`
2. Kiểm tra API key có phải publishable key không

### Lỗi: "Table not found"
**Giải pháp**:
1. Chạy DATABASE_SETUP.sql trong Supabase SQL Editor
2. Kiểm tra bảng đã được tạo: Supabase Console → Table Editor

---

## Workflow Tạo Campaign

1. **User kết nối ví** → `connectWallet()`
2. **Check admin** → `checkIfAdmin(address)`
3. **Nhập form** → Title, Description, Target, Duration, Image
4. **Submit** → `createCampaign()` (gọi smart contract)
5. **Blockchain** → `Genesis.createProject()` được execute
6. **Database** → Lưu campaign vào Supabase `campaigns` table
7. **Update UI** → Refresh campaigns list

---

## Workflow Donate

1. **User chọn campaign**
2. **Nhập số tiền** → Amount (ETH)
3. **Submit** → `donateToCampaign(projectId, amount, address)`
4. **Blockchain** → `Genesis.backProject(projectId)` + transfer ETH
5. **Database** → Lưu donation vào Supabase
6. **Update UI** → Refresh campaign raised amount + donations list

---

## Tiếp Theo

- [ ] Implement refund logic (khi campaign expire)
- [ ] Add payout functionality (admin withdraw funds)
- [ ] Implement campaign filters & search
- [ ] Add notification system
- [ ] Add user profile page
- [ ] Implement campaign comments/updates
- [ ] Add wallet verification with email
- [ ] Implement payment status tracking

---

## Contact & Support

Nếu có lỗi, vui lòng kiểm tra console (F12) để xem chi tiết error.

Happy coding! 🚀
