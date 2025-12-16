import { supabase } from './supabaseClients'
import { ethers } from 'ethers'
import GenesisABI from '../abis/src/contracts/Genesis.sol/Genesis.json'
import { ADMIN_ADDRESSES, CONTRACT_CONFIG, APP_CONSTANTS } from '../config/appConfig'

const contractAddress = CONTRACT_CONFIG.address

// ===== CAMPAIGN API =====

/**
 * Tạo campaign mới (chỉ admin hoặc owner)
 * @param {string} walletAddress - Địa chỉ ví của người tạo
 * @param {object} campaignData - {title, description, target, duration, image}
 * @returns {object} Campaign được tạo
 */
export const createCampaign = async (walletAddress, campaignData) => {
  try {
    // 1. Kiểm tra admin
    const isAdmin = await checkIsAdmin(walletAddress)
    if (!isAdmin) throw new Error("Chỉ admin mới có thể tạo campaign")

    // 2. Tạo campaign trên blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, GenesisABI.abi, signer)

    const expiresAt = Math.floor(Date.now() / 1000) + (parseInt(campaignData.duration) * 24 * 60 * 60)
    const cost = ethers.utils.parseEther(campaignData.target.toString())

    const tx = await contract.createProject(
      campaignData.title,
      campaignData.description,
      campaignData.image || "https://via.placeholder.com/600x350",
      cost,
      expiresAt,
      { gasLimit: 500000 }
    )

    console.log("Đang chờ transaction...", tx.hash)
    const receipt = await tx.wait()
    const projectId = receipt.events?.find(e => e.event === 'Action')?.args?.id?.toNumber() || 0

    // 3. Lưu campaign vào Supabase
    const { data, error } = await supabase
      .from('campaigns')
      .insert([
        {
          project_id: projectId,
          title: campaignData.title,
          description: campaignData.description,
          target_amount: parseFloat(campaignData.target),
          raised_amount: 0,
          duration_days: parseInt(campaignData.duration),
          image_url: campaignData.image || "https://via.placeholder.com/600x350",
          owner_address: walletAddress.toLowerCase(),
          status: 'OPEN',
          created_at: new Date(),
          expires_at: new Date(expiresAt * 1000)
        }
      ])
      .select()
      .single()

    if (error) throw error

    console.log("Campaign tạo thành công:", data)
    return data
  } catch (error) {
    console.error("Lỗi tạo campaign:", error)
    throw error
  }
}

/**
 * Lấy campaign theo ID
 */
export const getCampaignById = async (projectId) => {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('project_id', projectId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data || null
  } catch (error) {
    console.error("Lỗi lấy campaign:", error)
    return null
  }
}

/**
 * Liệt kê tất cả campaigns với filter
 * @param {string} status - 'OPEN', 'CLOSED', 'EXPIRED', 'SUCCESSFUL' hoặc null (tất cả)
 */
export const listCampaigns = async (status = null) => {
  try {
    let query = supabase.from('campaigns').select('*')

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Lỗi liệt kê campaigns:", error)
    return []
  }
}

/**
 * Lấy campaigns của 1 owner
 */
export const getCampaignsByOwner = async (ownerAddress) => {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('owner_address', ownerAddress.toLowerCase())
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Lỗi lấy campaigns của owner:", error)
    return []
  }
}

/**
 * Kiểm tra status của campaign
 */
export const checkCampaignStatus = async (projectId) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const contract = new ethers.Contract(contractAddress, GenesisABI.abi, provider)

    const project = await contract.getProject(projectId)
    const campaign = await getCampaignById(projectId)

    return {
      status: project.status, // 0=OPEN, 1=APPROVED, 2=REVERTED, 3=DELETED, 4=PAIDOUT
      raised: ethers.utils.formatEther(project.raised),
      cost: ethers.utils.formatEther(project.cost),
      backers: project.backers.toNumber(),
      expiresAt: new Date(project.expiresAt * 1000),
      dbStatus: campaign?.status
    }
  } catch (error) {
    console.error("Lỗi kiểm tra status:", error)
    return null
  }
}

/**
 * Cập nhật campaign (title, description, imageURL, duration)
 */
export const updateCampaign = async (projectId, campaignData) => {
  try {
    // 1. Update blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, GenesisABI.abi, signer)

    const newExpiresAt = campaignData.expiresAt || Math.floor(Date.now() / 1000) + (parseInt(campaignData.duration) * 24 * 60 * 60)

    const tx = await contract.updateProject(
      projectId,
      campaignData.title,
      campaignData.description,
      campaignData.image || "https://via.placeholder.com/600x350",
      newExpiresAt,
      { gasLimit: 300000 }
    )

    await tx.wait()

    // 2. Update Supabase
    const updateData = {}
    if (campaignData.title) updateData.title = campaignData.title
    if (campaignData.description) updateData.description = campaignData.description
    if (campaignData.image) updateData.image_url = campaignData.image
    if (campaignData.duration) updateData.duration_days = parseInt(campaignData.duration)
    if (campaignData.expiresAt) updateData.expires_at = new Date(campaignData.expiresAt * 1000)

    const { data, error } = await supabase
      .from('campaigns')
      .update(updateData)
      .eq('project_id', projectId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Lỗi update campaign:", error)
    throw error
  }
}

/**
 * Xóa campaign (chỉ nếu còn OPEN)
 */
export const deleteCampaign = async (projectId) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, GenesisABI.abi, signer)

    const tx = await contract.deleteProject(projectId, { gasLimit: 300000 })
    await tx.wait()

    // Update status ở Supabase
    const { data, error } = await supabase
      .from('campaigns')
      .update({ status: 'DELETED' })
      .eq('project_id', projectId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Lỗi xóa campaign:", error)
    throw error
  }
}

/**
 * Lấy thống kê campaigns
 */
export const getCampaignStats = async () => {
  try {
    const campaigns = await listCampaigns()

    const stats = {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'OPEN').length,
      totalRaised: campaigns.reduce((sum, c) => sum + (c.raised_amount || 0), 0),
      totalDonators: 0, // Tính từ donations table
      successfulCampaigns: campaigns.filter(c => c.status === 'SUCCESSFUL').length
    }

    return stats
  } catch (error) {
    console.error("Lỗi lấy statistics:", error)
    return null
  }
}

// ===== HELPER FUNCTIONS =====

/**
 * Kiểm tra user có phải admin không
 */
export const checkIsAdmin = async (walletAddress) => {
  try {
    // Kiểm tra từ config list
    return ADMIN_ADDRESSES.some(
      (adminAddr) => adminAddr.toLowerCase() === walletAddress.toLowerCase()
    )
  } catch (error) {
    console.error("Lỗi check admin:", error)
    return false
  }
}

/**
 * Format campaign data từ blockchain sang hiển thị
 */
export const formatCampaignData = (blockchainData, dbData = null) => {
  return {
    id: blockchainData.id?.toNumber ? blockchainData.id.toNumber() : blockchainData.id,
    title: blockchainData.title,
    description: blockchainData.description,
    image: blockchainData.imageURL,
    target: parseFloat(ethers.utils.formatEther(blockchainData.cost)),
    raised: parseFloat(ethers.utils.formatEther(blockchainData.raised)),
    backers: blockchainData.backers.toNumber ? blockchainData.backers.toNumber() : blockchainData.backers,
    owner: blockchainData.owner,
    status: ['OPEN', 'APPROVED', 'REVERTED', 'DELETED', 'PAIDOUT'][blockchainData.status],
    expiresAt: new Date(blockchainData.expiresAt * 1000),
    createdAt: new Date(blockchainData.timestamp * 1000),
    ...dbData
  }
}
