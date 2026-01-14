import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { ProjectProvider } from "./context/ProjectContext"; // ⭐ THÊM DÒNG NÀY

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <ProjectProvider>      {/* ⭐ WRAP APP BẰNG PROVIDER */}
      <App />
    </ProjectProvider>
  </BrowserRouter>
);
