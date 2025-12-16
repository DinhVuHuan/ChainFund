import React, { createContext, useContext, useState, useEffect } from "react";
import { listCampaigns, getCampaignsByOwner } from "../services/campaignAPI";
import { getAllProjectsFromBlockchain } from "../services/blockchain";

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([
    {
      id: 0,
      title: "Vietnam Flood Relief Fund",
      owner: "Admin",
      amountRaised: 2.5,
      target: 5,
      backers: 150,
      daysLeft: 10,
      progress: 50,
      status: "Active",
      image: "https://picsum.photos/600/350?random=0",
      description:
        "This campaign provides emergency support to families affected by severe flooding in Central Vietnam.",
    },
  ]);

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
        
        setProjects([...projects.slice(0, 1), ...formattedCampaigns]); // Keep default campaign
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
      
      const mergedCampaigns = blockchainProjects.map((bp) => {
        const dbCampaign = dbCampaigns.find(dc => dc.project_id === bp.id);
        return {
          ...bp,
          amountRaised: parseFloat(bp.raised),
          daysLeft: Math.ceil((new Date(bp.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)),
          progress: (parseFloat(bp.raised) / parseFloat(bp.cost)) * 100,
          image: bp.imageURL,
          ...dbCampaign,
        };
      });
      
      setProjects([...projects.slice(0, 1), ...mergedCampaigns]);
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
