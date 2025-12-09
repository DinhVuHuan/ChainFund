import React, { createContext, useContext, useState } from "react";

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects] = useState([
    {
      id: 0,
      title: "Vietnam",
      owner: "0x1234...ABCD",
      amountRaised: 2.5,
      goal: 5,
      backers: 150,
      daysLeft: 10,
      progress: 50,
      status: "Active",
      image: "https://picsum.photos/600/350?random=0",
      description:
        "This campaign provides emergency support to families affected by severe flooding...",
      history: [
        { donor: "0x1111...AAAA", amount: 0.5, time: "2 hours ago" },
        { donor: "0x2222...BBBB", amount: 1.0, time: "1 day ago" },
        { donor: "0x3333...CCCC", amount: 0.3, time: "3 days ago" },
      ],
    },

    {
      id: 1,
      title: "Build a Sustainable School in Remote Area",
      owner: "0x5678...EFGH",
      amountRaised: 10,
      goal: 10,
      backers: 300,
      daysLeft: 0,
      progress: 100,
      status: "Goal Met",
      image: "https://picsum.photos/600/350?random=1",
      description:
        "A project aiming to build a small eco-friendly school for children...",
      history: [
        { donor: "0x9999...ZZZZ", amount: 2, time: "3 days ago" },
      ],
    }
  ]);

  return (
    <ProjectContext.Provider value={{ projects }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => useContext(ProjectContext);
