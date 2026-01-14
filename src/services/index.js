// src/services/index.js
/**
 * ===== CHAINFUND API EXPORTS =====
 * Centralized export point for all services
 * 
 * Usage:
 * import { createCampaign, donateToCampaign, connectWallet } from './services'
 */

// Campaign API
export {
  createCampaign,
  getCampaignById,
  listCampaigns,
  getCampaignsByOwner,
  checkCampaignStatus,
  updateCampaign,
  deleteCampaign,
  getCampaignStats,
  checkIsAdmin,
  formatCampaignData,
} from './campaignAPI'

// Donation API
export {
  donateToCampaign,
  getTotalDonationByProject,
  getDonationsByProject,
  getDonationsByDonor,
  getDonationById,
  getDonorCountByProject,
  hasUserDonatedToProject,
  getTotalDonatedByUser,
  getProjectCountByDonor,
  getTopDonors,
  getDonationStats,
  formatDonationData,
} from './donationAPI'

// Blockchain API
export {
  connectWallet,
  checkIfAdmin,
  getUserInfo,
  getWalletBalance,
  getContractBalance,
  disconnectWallet,
  donateToProject,
  getDonationHistory,
  getProjectFromBlockchain,
  getAllProjectsFromBlockchain,
  getBackersOfProject,
  getContractStats,
} from './blockchain'

// Supabase
export { supabase } from './supabaseClients'
