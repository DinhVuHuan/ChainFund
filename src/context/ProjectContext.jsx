import React, { createContext, useContext, useState, useEffect } from "react";
import { listCampaigns, getCampaignsByOwner, setCampaignStatusInDb } from "../services/campaignAPI";
import { getAllProjectsFromBlockchain } from "../services/blockchain";

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  // Start with an empty list; we'll populate from DB and blockchain
  const [projects, setProjects] = useState([]);

  const [currentAccount, setCurrentAccount] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load campaigns từ blockchain và Supabase khi component mount
  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      
      // Lấy campaigns từ Supabase
      const campaigns = await listCampaigns();
      
      if (campaigns && campaigns.length > 0) {
        const formattedCampaigns = campaigns.map((c) => ({
          id: c.project_id,
          title: c.title,
          owner: c.owner_address,
          amountRaised: c.raised_amount || 0,
          target: c.target_amount,
          backers: 0, // Sẽ tính từ donations
          daysLeft: Math.ceil((new Date(c.expires_at) - new Date()) / (1000 * 60 * 60 * 24)),
          progress: ((c.raised_amount || 0) / c.target_amount) * 100,
          status: c.status,
          image: c.image_url,
          description: c.description,
          createdAt: c.created_at,
          expiresAt: c.expires_at,
        }));
        
        // compute derived statuses and update DB if needed
        const now = Date.now()
        for (const fc of formattedCampaigns) {
          const expires = new Date(fc.expiresAt).getTime()
          const raised = parseFloat(fc.amountRaised || 0)
          const target = parseFloat(fc.target || 0)
          let derived = 'Active'
          if (expires <= now && raised < target) derived = 'Expired'
          else if (raised >= target && now <= expires) derived = 'Approved'
          // if derived differs from DB status, update
          if (fc.status !== derived) {
            try { await setCampaignStatusInDb(fc.id, derived) } catch (e) { console.warn('Could not sync status to DB', e) }
            fc.status = derived
          }
        }

        setProjects(formattedCampaigns);
      }
    } catch (error) {
      console.error("Lỗi load campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  // Thêm project mới
  const createProject = (newProject) => {
    const id = projects.length;
    const newCampaign = {
      id,
      title: newProject.title,
      description: newProject.description,
      target: parseFloat(newProject.target),
      amountRaised: 0,
      backers: 0,
      daysLeft: parseInt(newProject.duration),
      progress: 0,
      status: "Active",
      image:
        newProject.image || `https://picsum.photos/600/350?random=${id}`,
      owner: currentAccount || "Admin",
      createdAt: new Date(),
    };
    
    setProjects([...projects, newCampaign]);
  };

  // Set current account
  const setAccount = (account) => {
    setCurrentAccount(account);
  };

  // Refresh campaigns từ blockchain
  const refreshCampaigns = async () => {
    try {
      setLoading(true);
      const blockchainProjects = await getAllProjectsFromBlockchain();
      const dbCampaigns = await listCampaigns();

      const now = Date.now()
      const mergedCampaigns = blockchainProjects.map((bp) => {
        const dbCampaign = dbCampaigns.find(dc => dc.project_id === bp.id) || {}
        const raised = parseFloat(bp.raised)
        const cost = parseFloat(bp.cost)
        const expires = new Date(bp.expiresAt).getTime()
        let derived = 'Active'
        if (expires <= now && raised < cost) derived = 'Expired'
        else if (raised >= cost && now <= expires) derived = 'Approved'

        // Merge mapping
        const merged = {
          id: bp.id,
          title: bp.title,
          owner: bp.owner,
          amountRaised: raised,
          target: cost,
          backers: bp.backers || 0,
          daysLeft: Math.ceil((expires - now) / (1000 * 60 * 60 * 24)),
          progress: cost > 0 ? (raised / cost) * 100 : 0,
          status: dbCampaign.status || derived,
          image: dbCampaign.image_url || bp.imageURL,
          description: dbCampaign.description || bp.description,
          createdAt: dbCampaign.created_at || bp.timestamp,
          expiresAt: dbCampaign.expires_at || bp.expiresAt
        }

        // Sync DB status if differs
        if ((dbCampaign.status || '') !== merged.status) {
          setCampaignStatusInDb(merged.id, merged.status).catch(e => console.warn('status sync failed', e))
        }

        return merged
      })

      setProjects(mergedCampaigns);
    } catch (error) {
      console.error("Lỗi refresh campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get campaigns của current user
  const getMyProjects = async () => {
    if (!currentAccount) return [];
    return await getCampaignsByOwner(currentAccount);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        createProject,
        admin,
        setAdmin,
        currentAccount,
        setAccount,
        loading,
        loadCampaigns,
        refreshCampaigns,
        getMyProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => useContext(ProjectContext);
