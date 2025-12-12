import React, { createContext, useContext, useState } from "react";

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

  // ❗ Hàm thêm project mới
  const createProject = (newProject) => {
    const id = projects.length;
    setProjects([
      ...projects,
      {
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
        owner: "Admin",
      },
    ]);
  };

  // ❗ Đặt tạm admin là "Admin"
  const admin = "Admin";

  return (
    <ProjectContext.Provider value={{ projects, createProject, admin }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => useContext(ProjectContext);
