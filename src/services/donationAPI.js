import { supabase } from './supabaseClients'
import { ethers } from 'ethers'
import GenesisABI from '../abis/src/contracts/Genesis.sol/Genesis.json'
import { CONTRACT_CONFIG } from '../config/appConfig'

const contractAddress = CONTRACT_CONFIG.address

// ===== DONATION API =====

/**
 * Donate cho campaign
 * @param {number} projectId - ID của project
 * @param {string} ethAmount - Số lượng ETH cần donate
 * @param {string} walletAddress - Địa chỉ ví người donate
 */
export const donateToCampaign = async (projectId, ethAmount, walletAddress) => {
  try {
    if (!window.ethereum) throw new Error("MetaMask chưa được kết nối")
    if (!ethAmount || parseFloat(ethAmount) <= 0) throw new Error("Số tiền phải lớn hơn 0")

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, GenesisABI.abi, signer)

    // 1. Gọi blockchain function
    const parsedAmount = ethers.utils.parseEther(ethAmount.toString())
    const tx = await contract.backProject(projectId, {
      value: parsedAmount,
      gasLimit: 500000
    })

    console.log("Donation transaction:", tx.hash)
    const receipt = await tx.wait()

    // 2. Lưu donation vào Supabase
    const { data, error } = await supabase
      .from('donations')
      .insert([
        {
          project_id: projectId,
          donor_address: walletAddress.toLowerCase(),
          amount_eth: parseFloat(ethAmount),
          amount_usd: null, // Có thể update sau với price API
          transaction_hash: tx.hash,
          status: 'CONFIRMED',
          donated_at: new Date()
        }
      ])
      .select()
      .single()

    if (error) throw error

    // 3. Update raised_amount ở campaigns table
    const campaign = await supabase
      .from('campaigns')
      .select('raised_amount')
      .eq('project_id', projectId)
      .single()

    if (campaign.data) {
      await supabase
        .from('campaigns')
        .update({ raised_amount: (campaign.data.raised_amount || 0) + parseFloat(ethAmount) })
        .eq('project_id', projectId)
    }

    console.log("Donation đã được lưu:", data)
    return data
  } catch (error) {
    console.error("Lỗi donate:", error)
    throw error
  }
}

/**
 * Lấy tổng tiền donate của 1 campaign
 */
export const getTotalDonationByProject = async (projectId) => {
  try {
    const { data, error } = await supabase
      .from('donations')
      .select('amount_eth')
      .eq('project_id', projectId)
      .eq('status', 'CONFIRMED')

    if (error) throw error

    const total = data.reduce((sum, d) => sum + (d.amount_eth || 0), 0)
    return total
  } catch (error) {
    console.error("Lỗi lấy tổng donation:", error)
    return 0
  }
}

/**
 * Lấy danh sách người đã donate cho campaign
 */
export const getDonationsByProject = async (projectId, limit = 50, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'CONFIRMED')
      .order('donated_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Lỗi lấy danh sách donors:", error)
    return []
  }
}

/**
 * Lấy lịch sử donation của 1 user
 */
export const getDonationsByDonor = async (donorAddress, limit = 50, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('donations')
      .select(`
        *,
        campaigns(title, image_url, status)
      `)
      .eq('donor_address', donorAddress.toLowerCase())
      .eq('status', 'CONFIRMED')
      .order('donated_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Lỗi lấy lịch sử donation:", error)
    return []
  }
}

/**
 * Lấy thông tin 1 donation
 */
export const getDonationById = async (donationId) => {
  try {
    const { data, error } = await supabase
      .from('donations')
      .select(`
        *,
        campaigns(title, image_url)
      `)
      .eq('id', donationId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data || null
  } catch (error) {
    console.error("Lỗi lấy donation:", error)
    return null
  }
}

/**
 * Lấy số lượng donors cho 1 campaign
 */
export const getDonorCountByProject = async (projectId) => {
  try {
    const { count, error } = await supabase
      .from('donations')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('status', 'CONFIRMED')

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error("Lỗi đếm donors:", error)
    return 0
  }
}

/**
 * Kiểm tra user đã donate vào campaign nào
 */
export const hasUserDonatedToProject = async (projectId, donorAddress) => {
  try {
    const { data, error } = await supabase
      .from('donations')
      .select('id')
      .eq('project_id', projectId)
      .eq('donor_address', donorAddress.toLowerCase())
      .eq('status', 'CONFIRMED')
      .limit(1)

    if (error) throw error
    return data && data.length > 0
  } catch (error) {
    console.error("Lỗi kiểm tra donation:", error)
    return false
  }
}

/**
 * Lấy tổng tiền mà 1 user đã donate
 */
export const getTotalDonatedByUser = async (donorAddress) => {
  try {
    const { data, error } = await supabase
      .from('donations')
      .select('amount_eth')
      .eq('donor_address', donorAddress.toLowerCase())
      .eq('status', 'CONFIRMED')

    if (error) throw error

    const total = data.reduce((sum, d) => sum + (d.amount_eth || 0), 0)
    return total
  } catch (error) {
    console.error("Lỗi tính tổng donate:", error)
    return 0
  }
}

/**
 * Lấy số lượng campaigns mà user đã donate
 */
export const getProjectCountByDonor = async (donorAddress) => {
  try {
    const { data, error } = await supabase
      .from('donations')
      .select('project_id')
      .eq('donor_address', donorAddress.toLowerCase())
      .eq('status', 'CONFIRMED')

    if (error) throw error

    // Count unique projects
    const uniqueProjects = new Set(data.map(d => d.project_id))
    return uniqueProjects.size
  } catch (error) {
    console.error("Lỗi đếm projects:", error)
    return 0
  }
}

/**
 * Lấy top donors (leaderboard)
 */
export const getTopDonors = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('donations')
      .select('donor_address, amount_eth')
      .eq('status', 'CONFIRMED')
      .order('amount_eth', { ascending: false })
      .limit(limit)

    if (error) throw error

    // Group by donor and sum amounts
    const donors = {}
    data.forEach(d => {
      const addr = d.donor_address
      donors[addr] = (donors[addr] || 0) + d.amount_eth
    })

    return Object.entries(donors)
      .map(([address, total]) => ({ address, totalDonated: total }))
      .sort((a, b) => b.totalDonated - a.totalDonated)
      .slice(0, limit)
  } catch (error) {
    console.error("Lỗi lấy top donors:", error)
    return []
  }
}

/**
 * Lấy donation statistics cho dashboard
 */
export const getDonationStats = async () => {
  try {
    const { data: donations, error } = await supabase
      .from('donations')
      .select('amount_eth, status')
      .eq('status', 'CONFIRMED')

    if (error) throw error

    const totalDonations = donations.length
    const totalAmount = donations.reduce((sum, d) => sum + d.amount_eth, 0)
    const avgDonation = totalDonations > 0 ? totalAmount / totalDonations : 0

    return {
      totalDonations,
      totalAmount,
      avgDonation: parseFloat(avgDonation.toFixed(4)),
      uniqueDonors: donations.length // Sẽ cần SQL distinct để chính xác hơn
    }
  } catch (error) {
    console.error("Lỗi lấy donation stats:", error)
    return null
  }
}

/**
 * Format donation data
 */
export const formatDonationData = (donation) => {
  return {
    id: donation.id,
    projectId: donation.project_id,
    donor: donation.donor_address.substring(0, 6) + '...' + donation.donor_address.substring(-4),
    amount: parseFloat(donation.amount_eth),
    txHash: donation.transaction_hash,
    status: donation.status,
    date: new Date(donation.donated_at),
    ...donation
  }
}
