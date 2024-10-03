import React, { useState } from 'react';
import { POST_LOGIN } from "../../helper/urlhelpers";
import './login.css';

const Login = ({ onSuccessfulLogin }) => {
    const [formData, setFormData] = useState({
        emailOrPhone: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const login = async (userData) => {
        const API_URL = process.env.REACT_APP_API_URL + POST_LOGIN;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
                credentials: 'include',
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Login failed');
            }

            if (responseData.success) {

                const UserID = responseData.data.user._id;

                const accessToken = responseData.data.accessToken;
                const refreshToken = responseData.data.refreshToken;

                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);
                localStorage.setItem("userID", UserID)

                setTimeout(() => {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    localStorage.removeItem("userID")
                }, 24 * 60 * 60 * 1000);

                return { responseData, UserID };
            }

            return { responseData };

        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const { emailOrPhone, password } = formData;

        if (!emailOrPhone) {
            setError('Please provide either email or phone number');
            return;
        }

        const isEmail = emailOrPhone.includes('@');
        const loginData = isEmail
            ? { email: emailOrPhone, password }
            : { phoneNumber: emailOrPhone, password };

        try {
            const result = await login(loginData);
            console.log('Login successful:', result);
            setSuccess('Login successful!');
            if (onSuccessfulLogin) {
                onSuccessfulLogin(loginData.email || loginData.phoneNumber);
            }
        } catch (error) {
            console.error('Login failed:', error.message);
            setError(error.message);
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <form onSubmit={handleSubmit} className="login-form">
                <input
                    type="text"
                    name="emailOrPhone"
                    value={formData.emailOrPhone}
                    onChange={handleChange}
                    placeholder="Email or Phone Number"
                    required
                />
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;

