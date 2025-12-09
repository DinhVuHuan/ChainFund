import React, { createContext, useContext, useState } from "react";

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects] = useState([
    {
      id: 0,
      title: 'Emergency Flood Relief for Central Vietnam',
      owner: '0x1234...ABCD',
      amountRaised: 2.5,
      goal: 5,
      backers: 150,
      daysLeft: 10,
      progress: 50,
      status: 'Active',
      image: "https://picsum.photos/400/300?random=0"
    },
    {
      id: 1,
      title: 'Build a Sustainable School in Remote Area',
      owner: '0x5678...EFGH',
      amountRaised: 10,
      goal: 10,
      backers: 300,
      daysLeft: 0,
      progress: 100,
      status: 'Goal Met',
      image: "https://picsum.photos/400/300?random=1"
    }
  ]);

  return (
    <ProjectContext.Provider value={{ projects }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => useContext(ProjectContext);
