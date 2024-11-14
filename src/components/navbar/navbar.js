import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../navbar/navbar.css'
import { POST_LOGOUT } from '../../helper/urlhelpers';

const Navbar = (isAuthenticated) => {
    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL + POST_LOGOUT;

    const handleLogout = async () => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                credentials: 'include', // This is important for cookies
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
                {isAuthenticated ? (
                    <li><button onClick={handleLogout}>Logout</button></li>
                ) : (
                    <li><Link to="/login">Login</Link></li>
                )}
            </ul>
        </nav>
    )
}

export default Navbar