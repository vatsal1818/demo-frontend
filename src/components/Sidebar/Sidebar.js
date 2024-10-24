import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
    return (
        <div className="sidebar">
            <Link to="/" style={{ textDecoration: "none" }}>
                <div className="sidebar-item">
                    <p>Add your data</p>
                </div>
            </Link>
            <Link to="chat" style={{ textDecoration: "none" }}>
                <div className="sidebar-item">
                    <p>Chat</p>
                </div>
            </Link>
            <Link to="alltrade" style={{ textDecoration: "none" }}>
                <div className="sidebar-item">
                    <p>All trade</p>
                </div>
            </Link>
            <Link to="courses" style={{ textDecoration: "none" }}>
                <div className="sidebar-item">
                    <p>Courses</p>
                </div>
            </Link>
            <Link to="my-courses" style={{ textDecoration: "none" }}>
                <div className="sidebar-item">
                    <p>My Courses</p>
                </div>
            </Link>
        </div>
    );
};

export default Sidebar;
