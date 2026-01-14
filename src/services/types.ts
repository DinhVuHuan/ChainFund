// src/services/types.ts
/**
 * ===== TYPESCRIPT TYPE DEFINITIONS =====
 * Optional: Dùng nếu bạn muốn convert project sang TypeScript
 */

// ===== Campaign Types =====

export interface Campaign {
  id: number
  project_id: number
  title: string
  description: string
  target_amount: number
  raised_amount: number
  duration_days: number
  image_url: string | null
  owner_address: string
  status: 'OPEN' | 'CLOSED' | 'EXPIRED' | 'SUCCESSFUL' | 'DELETED'
  created_at: string
  expires_at: string
  updated_at: string
}

export interface CreateCampaignInput {
  title: string
  description: string
  target: string
  duration: string
  image?: string
}

export interface CampaignStats {
  totalCampaigns: number
  activeCampaigns: number
  totalRaised: number
  totalDonators: number
  successfulCampaigns: number
}

// ===== Donation Types =====

export interface Donation {
  id: number
  project_id: number
  donor_address: string
  amount_eth: number
  amount_usd: number | null
  transaction_hash: string
  status: 'CONFIRMED' | 'PENDING' | 'FAILED'
  donated_at: string
}

export interface DonationStats {
  totalDonations: number
  totalAmount: number
  avgDonation: number
  uniqueDonors: number
}

export interface TopDonor {
  address: string
  totalDonated: number
}

// ===== User Types =====

export interface User {
  id: number
  address: string
  nonce: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

// ===== Blockchain Types =====

export interface ProjectFromBlockchain {
  id: number
  owner: string
  title: string
  description: string
  imageURL: string
  cost: string // ETH
  raised: string // ETH
  timestamp: Date
  expiresAt: Date
  backers: number
  status: 'OPEN' | 'APPROVED' | 'REVERTED' | 'DELETED' | 'PAIDOUT'
}

export interface Backer {
  owner: string
  contribution: string // ETH
  timestamp: Date
  refunded: boolean
}

export interface ContractStats {
  totalProjects: number
  totalBacking: number
  totalDonations: string // ETH
}

// ===== Error Types =====

export interface APIError {
  message: string
  code?: string
  originalError?: Error
}

// ===== Function Return Types =====

export interface CreateCampaignResult {
  success: boolean
  campaign?: Campaign
  error?: APIError
}

export interface DonateToCampaignResult {
  success: boolean
  donation?: Donation
  txHash?: string
  error?: APIError
}

export interface ConnectWalletResult {
  success: boolean
  address?: string
  user?: User
  error?: APIError
}

// ===== API Response Types =====

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: APIError
}

export interface ListResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

// ===== Event Types =====

export interface BlockchainEvent {
  id: number
  actionType: string
  executor: string
  timestamp: number
}

// ===== Config Types =====

export interface AppConfig {
  adminAddresses: string[]
  contractAddress: string
  supabaseUrl: string
  supabaseKey: string
  chainId: number
}
