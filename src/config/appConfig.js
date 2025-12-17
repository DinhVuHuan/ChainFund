// src/config/appConfig.js
// ===== APP CONFIGURATION =====

/**
 * Admin addresses (chỉnh sửa ở đây)
 * Thêm hoặc xóa addresses để quản lý admin users
 */
export const ADMIN_ADDRESSES = [
  "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", // Replace với address admin của bạn
  "0x8fa4c621f86eba072148b2fd6a20ccdb21b2f913", // Admin khác nếu có
];

/**
 * Contract configuration
 */
export const CONTRACT_CONFIG = {
  address: "0x5fbdb2315678afecb367f032d93f642f64180aa3",
  network: "hardhat", // hardhat, sepolia, mainnet
  chainId: 31337, // Hardhat: 31337, Sepolia: 11155111, Mainnet: 1
};

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  supabaseUrl: "https://otzxdwcherdfszyaortf.supabase.co",
  supabaseKey: "sb_publishable_ChOP0jmuHEnQDprQ6eEmng_wDjdVJCK",
};

/**
 * Application constants
 */
export const APP_CONSTANTS = {
  // Campaign defaults
  MIN_TARGET_ETH: 0.1,
  MAX_DURATION_DAYS: 365,
  MIN_DURATION_DAYS: 1,
  
  // Donation
  MIN_DONATION_ETH: 0.01,
  
  // Gas limits
  GAS_LIMIT_CREATE: 500000,
  GAS_LIMIT_DONATE: 500000,
  GAS_LIMIT_UPDATE: 300000,
  GAS_LIMIT_DELETE: 300000,
  
  // Pagination
  ITEMS_PER_PAGE: 20,
  
  // Cache (in ms)
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

/**
 * Helper function: Check nếu address là admin
 */
export const isAdminAddress = (address) => {
  if (!address) return false;
  return ADMIN_ADDRESSES.some(
    (adminAddr) => adminAddr.toLowerCase() === address.toLowerCase()
  );
};

/**
 * Helper function: Format ETH amount
 */
export const formatETH = (weiAmount, decimals = 4) => {
  try {
    const ethers = require("ethers");
    const formatted = ethers.utils.formatEther(weiAmount);
    return parseFloat(formatted).toFixed(decimals);
  } catch (error) {
    console.error("Error formatting ETH:", error);
    return "0";
  }
};

/**
 * Helper function: Parse ETH to Wei
 */
export const parseETH = (ethAmount) => {
  try {
    const ethers = require("ethers");
    return ethers.utils.parseEther(ethAmount.toString());
  } catch (error) {
    console.error("Error parsing ETH:", error);
    return "0";
  }
};

/**
 * Helper function: Truncate address
 */
export const truncateAddress = (address, chars = 4) => {
  if (!address) return "";
  return `${address.substring(0, chars + 2)}...${address.substring(
    address.length - chars
  )}`;
};
