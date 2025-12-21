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
    const defaultImage = `https://picsum.photos/600/350?random=${Math.floor(Math.random()*1000)}`

    // Log provider/network for debugging
    try {
      const net = await provider.getNetwork()
      console.log('DEBUG: provider network:', net)
      console.log('DEBUG: CONTRACT_CONFIG.chainId:', CONTRACT_CONFIG.chainId)
    } catch (e) {
      console.warn('DEBUG: cannot read provider network:', e)
    }

    // Send transaction to create project, with detailed error logging
    let tx
    // Basic input validation to catch common solidity require reverts early
    try {
      if (!campaignData.title || String(campaignData.title).trim().length === 0) throw new Error('Title is required')
      if (!campaignData.description || String(campaignData.description).trim().length === 0) throw new Error('Description is required')
      const dur = parseInt(campaignData.duration)
      if (isNaN(dur) || dur <= 0) throw new Error('Duration must be a positive integer')
      if (!cost || cost.lte && cost.lte(ethers.constants.Zero)) throw new Error('Target cost must be greater than 0')
    } catch (inputErr) {
      console.error('INPUT VALIDATION ERROR before createProject:', inputErr)
      throw inputErr
    }

    try {
      // Confirm signer matches provided walletAddress
      try {
        const signerAddr = await signer.getAddress()
        console.log('DEBUG: signer address:', signerAddr, 'expected walletAddress:', walletAddress)
        if (signerAddr.toLowerCase() !== walletAddress.toLowerCase()) {
          console.warn('WARNING: signer address differs from provided walletAddress')
        }
      } catch (e) {
        console.warn('DEBUG: cannot get signer address:', e)
      }

      // Estimate gas to surface estimation errors earlier
      let gasLimitToUse = ethers.BigNumber.from(500000)
      try {
        const estimated = await contract.estimateGas.createProject(
          campaignData.title,
          campaignData.description,
          campaignData.image || defaultImage,
          cost,
          expiresAt
        )
        // add 20% buffer
        const buffer = estimated.mul(ethers.BigNumber.from(120)).div(ethers.BigNumber.from(100))
        gasLimitToUse = buffer
        console.log('DEBUG: estimated gas:', estimated.toString(), 'using gasLimit:', gasLimitToUse.toString())
      } catch (estErr) {
        console.warn('Could not estimate gas for createProject:', estErr)
        // continue with default gasLimit; but surface estErr for debugging
      }

      tx = await contract.createProject(
        campaignData.title,
        campaignData.description,
        campaignData.image || defaultImage,
        cost,
        expiresAt,
        { gasLimit: gasLimitToUse }
      )
    } catch (err) {
      // Serialize error with non-enumerable props
      const ser = {}
      Object.getOwnPropertyNames(err).forEach((k) => {
        try { ser[k] = err[k] } catch (e) { ser[k] = String(err[k]) }
      })
      console.error('ERROR: contract.createProject failed:', err)
      console.error('ERROR: contract.createProject serialized error:', ser)
      // If RPC returned data with revert reason, include it
      const rpcMsg = (err && (err.data || err.body || err.error)) || null
      throw new Error(`createProject RPC error: ${err.message || String(err)}${rpcMsg ? ' | rpc: ' + JSON.stringify(rpcMsg) : ''}`)
    }

    console.log("Đang chờ transaction...", tx.hash)
    const receipt = await tx.wait()
    try {
      console.log('DEBUG: Full transaction receipt JSON:\n', JSON.stringify(receipt, null, 2))
    } catch (e) {
      console.log('DEBUG: Could not stringify receipt (circular structures), printing shallow fields: ', {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        status: receipt.status,
        logsLength: (receipt.logs || []).length,
        eventsLength: (receipt.events || []).length
      })
    }

    // Try multiple strategies to determine created projectId
    let projectId = null

    // 1) Prefer decoded events from receipt.events (ethers may populate this)
    try {
      if (receipt.events && receipt.events.length > 0) {
        const actionEvent = receipt.events.find(e => e.event === 'Action')
        if (actionEvent && actionEvent.args && actionEvent.args.id !== undefined) {
          projectId = actionEvent.args.id.toNumber ? actionEvent.args.id.toNumber() : Number(actionEvent.args.id)
          console.log('Found projectId from receipt.events Action:', projectId)
        }
      }
    } catch (e) {
      console.warn('Error checking receipt.events:', e)
    }

    // 2) Try parsing raw logs if not found
    if (projectId === null) {
      try {
        for (const log of receipt.logs || []) {
          try {
            const parsed = contract.interface.parseLog(log)
            if (parsed && parsed.name === 'Action' && parsed.args && parsed.args.id !== undefined) {
              projectId = parsed.args.id.toNumber ? parsed.args.id.toNumber() : Number(parsed.args.id)
              console.log('Found projectId from logs Action:', projectId)
              break
            }
          } catch (e) {
            continue
          }
        }
      } catch (e) {
        console.warn('Không parse được logs để lấy projectId:', e)
      }
    }

    // 3) Fallback: try projectCount - 1, then verify by fetching project
    if (projectId === null) {
      try {
        const countBn = await contract.projectCount()
        const count = countBn.toNumber ? countBn.toNumber() : Number(countBn)
        console.log('DEBUG: contract.projectCount =', count)
        const candidate = Math.max(0, count - 1)
        console.log('Fallback candidate projectId =', candidate)

        // Verify candidate by fetching project and comparing basic fields (title)
        try {
          const proj = await contract.getProject(candidate)
          try {
            console.log('DEBUG: fetched candidate project:', JSON.stringify({
              id: proj.id?.toNumber ? proj.id.toNumber() : proj.id,
              owner: proj.owner,
              title: proj.title,
              timestamp: proj.timestamp?.toNumber ? proj.timestamp.toNumber() : proj.timestamp
            }, null, 2))
          } catch (inner) {
            console.log('DEBUG: fetched candidate project (shallow):', {
              id: proj.id,
              owner: proj.owner,
              title: proj.title
            })
          }
          const projTitle = proj.title || proj.title.toString()
          if (projTitle && projTitle === campaignData.title) {
            projectId = candidate
            console.log('Verified fallback candidate by title match:', projectId)
          } else {
            console.warn('Candidate title mismatch:', projTitle, '!=', campaignData.title)
          }
        } catch (e) {
          console.warn('Cannot fetch project for candidate verification:', e)
        }
      } catch (e) {
        console.error('Không lấy được projectCount từ contract:', e)
      }
    }

    // 4) Last resort: scan all projects and try to find a recent project with matching title/owner
    if (projectId === null) {
      try {
        const projects = await contract.getProjects()
        const signerAddress = await signer.getAddress()
        for (let idx = 0; idx < projects.length; idx++) {
          const p = projects[idx]
          const owner = p.owner
          const title = p.title
          if (owner && owner.toLowerCase() === signerAddress.toLowerCase() && title === campaignData.title) {
            projectId = idx
            console.log('Found projectId by scanning getProjects:', projectId)
            break
          }
        }
      } catch (e) {
        console.warn('Cannot scan getProjects for fallback:', e)
      }
    }

    // 5) Provider log search fallback: query chain logs for Action event in block range around tx
    if (projectId === null) {
      try {
        const usedProvider = signer.provider || provider || new ethers.providers.Web3Provider(window.ethereum)
        const txBlock = receipt.blockNumber || null
        if (txBlock) {
          const fromBlock = Math.max(0, txBlock - 10)
          const toBlock = txBlock + 10
          console.log(`Searching logs for Action event in blocks ${fromBlock}..${toBlock}`)
          const filter = contract.filters.Action()
          const logs = await usedProvider.getLogs({
            fromBlock,
            toBlock,
            address: contractAddress,
            topics: filter.topics
          })

          for (const lg of logs) {
            try {
              const parsed = contract.interface.parseLog(lg)
              if (parsed && parsed.name === 'Action' && parsed.args && parsed.args.id !== undefined) {
                if (!receipt.transactionHash || (lg.transactionHash && lg.transactionHash.toLowerCase() === receipt.transactionHash.toLowerCase())) {
                  projectId = parsed.args.id.toNumber ? parsed.args.id.toNumber() : Number(parsed.args.id)
                  console.log('Found projectId from provider.getLogs:', projectId)
                  break
                }
              }
            } catch (e) {
              continue
            }
          }
        } else {
          console.warn('Receipt has no blockNumber; cannot perform provider.getLogs fallback')
        }
      } catch (e) {
        console.warn('Provider log-search fallback failed:', e)
      }
    }

    if (projectId === null) {
      console.error('All methods failed to determine projectId. Receipt:', receipt)
      throw new Error('Không thể xác định `projectId` từ transaction receipt')
    }

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
          image_url: campaignData.image || defaultImage,
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
 * Read contract internal balance (tracked by contract)
 */
export const getContractInternalBalance = async () => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const contract = new ethers.Contract(contractAddress, GenesisABI.abi, provider)
    const bal = await contract.getInternalBalance()
    return ethers.utils.formatEther(bal)
  } catch (error) {
    console.error('Lỗi lấy internal contract balance:', error)
    return null
  }
}

/**
 * Trigger on-chain payout for an approved project.
 * Caller must be project owner or contract owner in UI (frontend should check permissions).
 */
export const payoutProject = async (projectId) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, GenesisABI.abi, signer)

    // Sanity check: read project so we fail fast if project doesn't exist or not approved
    let project
    try {
      project = await contract.getProject(projectId)
    } catch (e) {
      // getProject will revert if project not found
      throw new Error('Project not found on-chain')
    }

    // ensure project is approved and payout delay reached
    if (Number(project.status) !== 1) throw new Error('Project is not APPROVED')
    const now = Math.floor(Date.now() / 1000)
    if (now < Number(project.payOutAt)) throw new Error('Payout delay not reached')

    // estimate gas safely
    let gasLimit = null
    try {
      const est = await contract.estimateGas.payOutProject(projectId)
      gasLimit = est.mul(ethers.BigNumber.from(120)).div(ethers.BigNumber.from(100))
    } catch (e) {
      console.warn('Could not estimate gas for payOutProject:', e)
      // If estimation fails with UNPREDICTABLE_GAS_LIMIT it's usually because the tx would revert.
      // Stop and surface a clear error rather than guessing a gasLimit.
      throw new Error('Gas estimation failed; transaction may revert. ' + (e.message || e))
    }

    const tx = await contract.payOutProject(projectId, { gasLimit })
    const receipt = await tx.wait()
    return receipt
  } catch (error) {
    console.error('Error executing payOutProject:', error)
    throw error
  }
}

/**
 * Subscribe to on-chain events for live updates (ProjectBacked, RefundProcessed, PayoutProcessed)
 * Pass handlers: { onBacked, onRefund, onPayout }
 */
export const subscribeToContractEvents = (handlers = {}) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const contract = new ethers.Contract(contractAddress, GenesisABI.abi, provider)

    if (handlers.onBacked) {
      contract.on('ProjectBacked', (id, backer, amount, timestamp) => {
        handlers.onBacked({ id: id.toNumber ? id.toNumber() : Number(id), backer, amount: ethers.utils.formatEther(amount), timestamp: Number(timestamp) })
      })
    }

    if (handlers.onRefund) {
      contract.on('RefundProcessed', (id, recipient, amount, timestamp) => {
        handlers.onRefund({ id: id.toNumber ? id.toNumber() : Number(id), recipient, amount: ethers.utils.formatEther(amount), timestamp: Number(timestamp) })
      })
    }

    if (handlers.onPayout) {
      contract.on('PayoutProcessed', (id, recipient, amount, tax, timestamp) => {
        handlers.onPayout({ id: id.toNumber ? id.toNumber() : Number(id), recipient, amount: ethers.utils.formatEther(amount), tax: ethers.utils.formatEther(tax), timestamp: Number(timestamp) })
      })
    }

    return () => {
      try { contract.removeAllListeners() } catch(e) { console.warn('unsubscribe error', e) }
    }
  } catch (error) {
    console.error('Lỗi subscribeToContractEvents:', error)
    return () => {}
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
 * Set campaign status in Supabase only (no on-chain changes)
 * @param {number} projectId
 * @param {string} status - human-friendly status like 'Active','Expired','Complete'
 */
export const setCampaignStatusInDb = async (projectId, status) => {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .update({ status })
      .eq('project_id', projectId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Lỗi setCampaignStatusInDb:', error)
    return null
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
      totalDonators: 0, // will compute from donations table
      successfulCampaigns: campaigns.filter(c => c.status === 'SUCCESSFUL').length
    }

    // Count distinct donors across all confirmed donations
    try {
      const { data: donations, error } = await supabase
        .from('donations')
        .select('donor_address')
        .eq('status', 'CONFIRMED')

      if (!error && donations) {
        stats.totalDonators = new Set(donations.map(d => d.donor_address)).size
      }
    } catch (e) {
      console.warn('Không thể tính totalDonators:', e)
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
