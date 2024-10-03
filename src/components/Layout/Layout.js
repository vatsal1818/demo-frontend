import React from "react";
import Sidebar from "../Sidebar/Sidebar.js";
import "./Layout.css";

const Layout = ({ children }) => {
    return (
        <div className="layout">
            <Sidebar />
            <div className="content">{children}</div>
        </div>
    );
};

export default Layout;
