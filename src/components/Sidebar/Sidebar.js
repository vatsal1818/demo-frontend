import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import "./Sidebar.css";
import { LINK_STATE } from "../../helper/Apihelpers.js";

const Sidebar = () => {
    const [linkStates, setLinkStates] = useState({
        home: true,
        chat: true,
        alltrade: true,
        courses: true,
        myCourses: true
    });
    const navigate = useNavigate();
    const userId = localStorage.getItem("userID")


    useEffect(() => {
        fetchUserLinkStates();
        const interval = setInterval(fetchUserLinkStates, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Check if any link state is disabled (false)
        if (Object.values(linkStates).some(state => !state)) {
            navigate("/home-page");
        }
    }, [linkStates, navigate]);

    const fetchUserLinkStates = async () => {
        if (!userId) return;

        try {
            const response = await axios.get(`${LINK_STATE}/${userId}/link-states`);
            setLinkStates(response.data.links);
        } catch (error) {
            console.error('Error fetching user link states:', error);
        }
    };

    const SidebarLink = ({ to, state, text }) => {
        if (!state) return null; // Don't render anything if the link is disabled

        return (
            <Link to={to} style={{ textDecoration: "none" }}>
                <div className="sidebar-item">
                    <p>{text}</p>
                </div>
            </Link>
        );
    };

    return (
        <div className="sidebar">
            <SidebarLink
                to="/"
                state={linkStates.home}
                text="Add your data"
            />
            <SidebarLink
                to="chat"
                state={linkStates.chat}
                text="Chat"
            />
            <SidebarLink
                to="alltrade"
                state={linkStates.alltrade}
                text="All trade"
            />
            <SidebarLink
                to="courses"
                state={linkStates.courses}
                text="Courses"
            />
            <SidebarLink
                to="my-courses"
                state={linkStates.myCourses}
                text="My Courses"
            />
        </div>
    );
};

export default Sidebar;
