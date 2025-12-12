import React, { createContext, useContext, useState } from "react";

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects] = useState([
    {
      id: 0,
      title: "Vietnam Flood Relief Fund",
      owner: "0x1234...ABCD",
      amountRaised: 2.5,
      goal: 5,
      backers: 150,
      daysLeft: 10,
      progress: 50,
      status: "Active",
      image: "https://picsum.photos/600/350?random=0",
      description: "This campaign provides emergency support to families affected by severe flooding in Central Vietnam.",
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
      description: "A project aiming to build a small eco-friendly school for children in a remote mountainous village.",
      history: [{ donor: "0x9999...ZZZZ", amount: 2, time: "3 days ago" }],
    },

    {
      id: 2,
      title: "Clean Water Wells for Cambodia",
      owner: "0xABCD...1234",
      amountRaised: 3.2,
      goal: 8,
      backers: 210,
      daysLeft: 25,
      progress: 40,
      status: "Active",
      image: "https://picsum.photos/600/350?random=2",
      description: "Building clean water wells to support rural communities in Cambodia.",
      history: [
        { donor: "0x44FF...AA12", amount: 1.1, time: "5 hours ago" },
        { donor: "0x22CE...B312", amount: 0.2, time: "2 days ago" },
      ],
    },

    {
      id: 3,
      title: "Medical Aid for Children with Heart Disease",
      owner: "0xFA12...55AC",
      amountRaised: 7.5,
      goal: 12,
      backers: 500,
      daysLeft: 12,
      progress: 62,
      status: "Active",
      image: "httpsum.photos/600/350?random=3",
      description: "Providing surgeries and urgent medical support for children with congenital heart disease.",
      history: [{ donor: "0x82AB...335C", amount: 0.8, time: "1 hour ago" }],
    },

    {
      id: 4,
      title: "Support Homeless People with Winter Clothes",
      owner: "0x9932...AFAA",
      amountRaised: 1.1,
      goal: 4,
      backers: 87,
      daysLeft: 5,
      progress: 27,
      status: "Active",
      image: "https://picsum.photos/600/350?random=4",
      description: "Providing warm clothes and blankets for homeless individuals during winter.",
      history: [{ donor: "0xDEAD...BEEF", amount: 0.05, time: "8 hours ago" }],
    },

    {
      id: 5,
      title: "Rebuild Homes After Wildfire",
      owner: "0xAA77...9911",
      amountRaised: 6.4,
      goal: 10,
      backers: 234,
      daysLeft: 18,
      progress: 64,
      status: "Active",
      image: "https://picsum.photos/600/350?random=5",
      description: "Helping families rebuild homes destroyed by the recent wildfire disaster.",
      history: [
        { donor: "0x2333...CE33", amount: 1.0, time: "1 day ago" },
        { donor: "0x8844...DD88", amount: 0.4, time: "7 hours ago" },
      ],
    },

    {
      id: 6,
      title: "Scholarship Fund for Poor Students",
      owner: "0x4422...1122",
      amountRaised: 9.9,
      goal: 15,
      backers: 700,
      daysLeft: 40,
      progress: 66,
      status: "Active",
      image: "https://picsum.photos/600/350?random=6",
      description: "Providing tuition support and learning materials to underprivileged students.",
      history: [{ donor: "0x2299...FAFA", amount: 2.2, time: "3 days ago" }],
    },

    {
      id: 7,
      title: "Plant 10,000 Trees for Climate Action",
      owner: "0x9911...EE44",
      amountRaised: 12,
      goal: 20,
      backers: 600,
      daysLeft: 50,
      progress: 60,
      status: "Active",
      image: "https://picsum.photos/600/350?random=7",
      description: "A project to plant 10,000 new trees to fight deforestation.",
      history: [{ donor: "0x7744...CCA3", amount: 1.5, time: "6 hours ago" }],
    },

    {
      id: 8,
      title: "Emergency Food for War-Affected Families",
      owner: "0x8833...DBC1",
      amountRaised: 4.7,
      goal: 12,
      backers: 340,
      daysLeft: 3,
      progress: 39,
      status: "Active",
      image: "https://picsum.photos/600/350?random=8",
      description: "Delivering essential food packages to communities affected by conflict.",
      history: [{ donor: "0x2288...AA33", amount: 0.9, time: "9 hours ago" }],
    },

    {
      id: 9,
      title: "Support Orphanage with Daily Essentials",
      owner: "0x1144...CD22",
      amountRaised: 8,
      goal: 8,
      backers: 410,
      daysLeft: 0,
      progress: 100,
      status: "Goal Met",
      image: "https://picsum.photos/600/350?random=9",
      description: "Providing food, books, and electricity support for an orphanage.",
      history: [
        { donor: "0xAAFF...33AA", amount: 0.5, time: "12 hours ago" },
        { donor: "0xCC33...55EE", amount: 1.3, time: "4 days ago" },
      ],
    },
  ]);

  return (
    <ProjectContext.Provider value={{ projects }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => useContext(ProjectContext);
