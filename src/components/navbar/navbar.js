import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../navbar/navbar.css'
import { POST_LOGOUT } from '../../helper/urlhelpers'

const Navbar = () => {
    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL + POST_LOGOUT;

    const isLoggedIn = () => {
        return Boolean(
            localStorage.getItem('accessToken') &&
            localStorage.getItem('refreshToken') &&
            localStorage.getItem('userID')
        );
    };

    const handleLogout = async () => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                // Clear local storage
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userID')

                // Redirect to login page
                navigate('/login');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <nav className='navbar'>
            <div className='navbar-logo'>
                <Link to='/'>Logo</Link>
            </div>
            <ul className='navbar-links'>
                <li><Link to="/home-page">Home</Link></li>
                <li><Link to="/about-page">About Us</Link></li>
                <li><Link to="/contact-page">Contact Us</Link></li>
                {isLoggedIn() ? (
                    <li><button onClick={handleLogout}>Logout</button></li>
                ) : (
                    <li><Link to="/login">Login</Link></li>
                )}
            </ul>
        </nav>
    )
}

export default Navbar