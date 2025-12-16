# ChainFund - Architecture & Flow Diagrams

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              UI Components                                 │ │
│  │  ├─ Header (Connect Wallet)                               │ │
│  │  ├─ Projects (Campaign List)                              │ │
│  │  ├─ CreateProjects (Admin Only)                           │ │
│  │  ├─ ProjectDetail (Campaign Detail)                       │ │
│  │  ├─ DonatePage (Donation Form)                            │ │
│  │  └─ ExampleComponents (5 Example Components)              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↓                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         ProjectContext (Global State)                      │ │
│  │  ├─ projects[]                                             │ │
│  │  ├─ currentAccount                                         │ │
│  │  ├─ admin                                                  │ │
│  │  └─ Functions: createProject, refreshCampaigns, etc       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                   ↙            ↓            ↖                    │
├──────────────────────────────────────────────────────────────────┤
│              Services (Business Logic)                           │
│  ┌──────────────────┬──────────────────┬──────────────────┐    │
│  │  campaignAPI.js  │  donationAPI.js  │  blockchain.js   │    │
│  │  (10 functions)  │  (12 functions)  │  (12 functions)  │    │
│  └──────────────────┴──────────────────┴──────────────────┘    │
│                            ↓                                     │
├──────────────────────────────────────────────────────────────────┤
│              Backend (Supabase + Smart Contract)                │
│  ┌──────────────────────────────┐  ┌────────────────────────┐  │
│  │   Supabase (PostgreSQL)      │  │ Ethereum Blockchain    │  │
│  │  ┌──────────────────────────┐│  │  ┌──────────────────┐  │  │
│  │  │ Tables:                  ││  │  │ Genesis Contract │  │  │
│  │  │ • users                  ││  │  │  (Smart Contract)│  │  │
│  │  │ • campaigns              ││  │  │  ├─ createProject│  │  │
│  │  │ • donations              ││  │  │  ├─ backProject │  │  │
│  │  │                          ││  │  │  ├─ updateProject│  │  │
│  │  └──────────────────────────┘│  │  │  ├─ deleteProject│  │  │
│  └──────────────────────────────┘  │  │  └─ payOutProject│  │  │
│                                     │  └──────────────────┘  │  │
│                                     └────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## 2. Campaign Creation Flow

```
┌──────────────────┐
│   Admin User     │
│  (with wallet)   │
└────────┬─────────┘
         │
         ↓
┌─────────────────────────┐
│ Navigate to             │
│ Create Campaign Page    │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│ ProjectContext checks:          │
│ ├─ isAdmin?                    │
│ └─ currentAccount?             │
└────────┬────────────────────────┘
         │
    ┌────┴────┐
    ↓         ↓
   YES        NO
    │         └─→ [DISABLED]
    ↓
┌─────────────────────────┐
│  User fills form:       │
│  • Title               │
│  • Description         │
│  • Target (ETH)        │
│  • Duration (days)     │
│  • Image URL           │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│ Click "Create Campaign"         │
│ → campaignAPI.createCampaign() │
└────────┬────────────────────────┘
         │
         ↓ (Async)
┌─────────────────────────────────┐
│ 1. Call Smart Contract:         │
│    Genesis.createProject()      │
│    • Blockchain execution       │
│    • Gas cost: ~200k units      │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│ 2. MetaMask Popup:              │
│    • Confirm transaction        │
│    • Accept gas fees            │
│    • Sign with private key      │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│ 3. Wait for blockchain:         │
│    • tx.wait()                  │
│    • ~15 seconds (Ethereum)     │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│ 4. Save to Supabase:            │
│    campaigns.insert({           │
│      project_id,                │
│      title, description,        │
│      target_amount,             │
│      owner_address, ...         │
│    })                           │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│ 5. Update React State:          │
│    ProjectContext.createProject()
│    → setProjects([...])         │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│ 6. Show Success Message         │
│    "Campaign created!"          │
│    Clear form                   │
└─────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│ 7. Redirect or Update UI:       │
│    Campaign appears in list     │
│    Users can see & donate       │
└─────────────────────────────────┘
```

---

## 3. Donation Flow

```
┌──────────────────────┐
│   Regular User       │
│  (any wallet)        │
└────────┬─────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ 1. Connect Wallet (if needed)    │
│    → connectWallet()             │
│    → MetaMask signature verify   │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ 2. Browse Campaigns              │
│    listCampaigns()               │
│    Display projects              │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ 3. Select Campaign & Amount      │
│    projectId = 1                 │
│    amount = 0.5 ETH              │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ 4. Click "Donate" Button         │
│    → donateToCampaign()          │
└────────┬─────────────────────────┘
         │
         ↓ (Async)
┌──────────────────────────────────┐
│ 5. Call Smart Contract:          │
│    Genesis.backProject(          │
│      projectId,                  │
│      {value: parsedAmount}       │
│    )                             │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ 6. MetaMask Popup:               │
│    • Amount: 0.5 ETH             │
│    • Gas: ~0.005 ETH             │
│    • Confirm & Sign              │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ 7. Blockchain:                   │
│    • Transfer 0.5 ETH            │
│    • Execute backProject()       │
│    • Emit event "PROJECT BACKED" │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ 8. Save to Supabase donations:   │
│    {                             │
│      project_id,                 │
│      donor_address,              │
│      amount_eth,                 │
│      transaction_hash,           │
│      status: 'CONFIRMED'         │
│    }                             │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ 9. Update campaign.raised_amount │
│    (in Supabase)                 │
│    += 0.5                        │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ 10. Update React State:          │
│     refreshCampaigns()           │
│     → UI updates                 │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ 11. Show Success:                │
│     "Donation successful!"       │
│     • Show in supporters list    │
│     • Update progress bar        │
│     • Refresh campaign detail    │
└──────────────────────────────────┘
```

---

## 4. Data Flow Diagram

```
User Input
    │
    ↓
┌──────────────────────────────────┐
│    React Component               │
│  (CreateProjects, DonatePage)    │
└──────────┬───────────────────────┘
           │
           ↓
┌──────────────────────────────────┐
│   Service Layer                  │
│  campaignAPI / donationAPI        │
│  blockchain                      │
└──────────┬───────────────────────┘
           │
    ┌──────┴──────┐
    ↓             ↓
┌────────────┐  ┌──────────────────┐
│ Smart      │  │  Supabase        │
│ Contract   │  │  (PostgreSQL)    │
│ (Solidity) │  │                  │
│            │  │  INSERT / UPDATE │
│ Execute    │  │  SELECT          │
│ Transaction│  │                  │
└────────┬───┘  └────────┬─────────┘
         │                │
         ↓                ↓
    ┌────────────────────────────┐
    │   Data Stored              │
    │ • Blockchain State         │
    │ • Supabase Database        │
    └────────┬───────────────────┘
             │
             ↓
    ┌────────────────────────────┐
    │  Services fetch data       │
    │  & format response         │
    └────────┬───────────────────┘
             │
             ↓
    ┌────────────────────────────┐
    │  React Context Update      │
    │  setProjects([...])        │
    └────────┬───────────────────┘
             │
             ↓
    ┌────────────────────────────┐
    │  Component Re-render       │
    │  Display updated data      │
    └────────────────────────────┘
```

---

## 5. Database Relationships

```
┌──────────────────┐
│     users        │
├──────────────────┤
│ id (PK)          │
│ address (UNIQUE) │
│ nonce            │
│ is_admin         │
│ created_at       │
└────────┬─────────┘
         │
    ┌────┴─────────┬──────────┐
    │              │          │
    ↓              ↓          ↓
┌───────────────────┐   ┌────────────────┐
│   campaigns       │   │   donations    │
├───────────────────┤   ├────────────────┤
│ id (PK)           │   │ id (PK)        │
│ project_id        │   │ project_id(FK) │
│ title             │   │ donor_address  │
│ description       │   │ amount_eth     │
│ target_amount     │   │ amount_usd     │
│ raised_amount     │   │ tx_hash        │
│ owner_address (FK)│   │ status         │
│ status            │   │ donated_at     │
│ image_url         │   └────────────────┘
│ created_at        │
│ expires_at        │
└───────────────────┘

Relationships:
• campaigns.owner_address → users.address (FK)
• donations.donor_address → users.address (FK)
• donations.project_id → campaigns.project_id (FK)
```

---

## 6. API Call Sequence

```
Frontend React Component
        │
        ↓ (import function)
┌───────────────────────────────┐
│ campaignAPI.createCampaign()  │
│ or                            │
│ donationAPI.donateToCampaign()│
│ or                            │
│ blockchain.connectWallet()    │
└───────────┬───────────────────┘
            │
            ↓ (check params)
    Validate inputs
            │
            ↓
    ┌───────────────────┐
    │ If blockchain:    │
    │ Initialize ethers │
    │ Get signer, etc   │
    └────────┬──────────┘
             │
             ↓
    Contract function call
    (with try-catch)
             │
             ↓
    MetaMask popup
             │
             ↓
    Execute transaction
             │
             ↓
    Wait for confirmation
    (tx.wait())
             │
             ↓
    ┌───────────────────┐
    │ Supabase.insert() │
    │ or                │
    │ .update()         │
    └────────┬──────────┘
             │
             ↓
    Return formatted data
             │
             ↓
    Component receives data
             │
             ↓
    Update React state
             │
             ↓
    Component re-renders
             │
             ↓
    User sees result
```

---

## 7. Admin Check Flow

```
User connects wallet
        │
        ↓
connectWallet()
        │
    ┌───┴────┐
    │        │
    ↓        ↓
Check     Create
users     if not
table     exists
    │        │
    └───┬────┘
        │
        ↓
Sign message (nonce)
        │
        ↓
checkIfAdmin(address)
        │
    ┌───┴────────────────────┐
    │                        │
    ↓                        ↓
Address in            Address NOT in
ADMIN_ADDRESSES       ADMIN_ADDRESSES
(from config)             │
    │                     │
    ↓                     ↓
TRUE                   FALSE
    │                     │
    ↓                     ↓
Show form            Hide form
Allow campaign       Show message
creation             (admin only)
```

---

## 8. Campaign Status Transitions

```
                    OPEN
                     │
        ┌────────────┼────────────┐
        │            │            │
        ↓            ↓            ↓
    APPROVED    REVERTED     DELETED
        │            │            │
        ↓            ↓            ↓
    PAIDOUT      (refund)    (refund)
                   complete

Conditions:
├─ OPEN → APPROVED: raised >= cost
├─ OPEN → REVERTED: time expired
├─ OPEN → DELETED: owner deletes
├─ APPROVED → PAIDOUT: owner payout after delay
└─ Any → REVERTED/DELETED: triggers refund
```

---

## 9. Component Hierarchy

```
App
├─ Header
│  └─ (Connect Wallet button)
│
├─ Router/Pages
│  ├─ Home
│  │  └─ Hero
│  │
│  ├─ ProjectsPage
│  │  └─ Projects
│  │     ├─ ProjectCard (x many)
│  │     └─ (DonateModal)
│  │
│  ├─ CreateProjects
│  │  └─ (Form with admin check)
│  │
│  └─ ProjectDetail
│     ├─ ProjectInfo
│     ├─ DonationForm
│     ├─ DonorList
│     └─ Comments (optional)
│
├─ ProjectContext (Global)
│  └─ (projects, currentAccount, functions)
│
└─ Footer
```

---

## 10. Error Handling Flow

```
API Call
    │
    ↓
try {
    Execute function
    │
    └─→ Error occurs?
        │
        ├─→ NO: Return success
        │
        └─→ YES:
}
    │
    ↓
catch (error) {
    │
    ├─ Check error type
    │  ├─ User cancelled → show message
    │  ├─ Insufficient balance → show message
    │  ├─ Contract error → show message
    │  ├─ Network error → show message
    │  └─ Unknown → show generic message
    │
    ├─ Log to console (for debugging)
    │
    ├─ Update UI error state
    │
    └─ Allow user to retry
}
```

---

## Summary

This architecture follows these principles:

✅ **Separation of Concerns**
- Components only handle UI
- Services handle business logic
- Context handles state

✅ **Data Consistency**
- Blockchain = source of truth
- Supabase = cache & supplementary data
- Components stay in sync via context

✅ **Security**
- Wallet signature verification
- Admin checks
- Input validation

✅ **Scalability**
- Modular APIs
- Easy to add features
- Clean error handling

✅ **User Experience**
- Clear feedback (success/error)
- Loading states
- Transaction tracking
