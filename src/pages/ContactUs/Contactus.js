import React, { useState, useRef, useEffect } from 'react';
import './ContactUs.css';
import { SEND_EMAILS } from '../../helper/Apihelpers';

const Contactus = () => {
    const initialFormState = {
        name: '',
        phone: '',
        email: '',
        message: '',
        country: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);

    const countries = [
        'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia',
        'Austria', 'Bangladesh', 'Belgium', 'Brazil', 'Canada',
        'China', 'Colombia', 'Denmark', 'Egypt', 'Finland',
        'France', 'Germany', 'Greece', 'India', 'Indonesia',
        'Iran', 'Iraq', 'Ireland', 'Italy', 'Japan',
        'Malaysia', 'Mexico', 'Netherlands', 'New Zealand', 'Norway',
        'Pakistan', 'Philippines', 'Poland', 'Portugal', 'Russia',
        'Saudi Arabia', 'Singapore', 'South Africa', 'South Korea', 'Spain',
        'Sweden', 'Switzerland', 'Thailand', 'Turkey', 'United Arab Emirates',
        'United Kingdom', 'United States', 'Vietnam'
    ];

    // Filter countries based on search query
    const filteredCountries = countries.filter(country =>
        country.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsCountryDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleCountrySelect = (country) => {
        setFormData(prevState => ({
            ...prevState,
            country: country
        }));
        setIsCountryDropdownOpen(false);
        setSearchQuery('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(SEND_EMAILS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Message sent successfully!');
                setFormData(initialFormState);
            } else {
                alert('Failed to send the message. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while sending the message.');
        }
    };

    return (
        <div className="contact-container">
            <h2>Contact Us</h2>
            <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your name"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="Enter your phone number"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email"
                    />
                </div>

                <div className="form-group" ref={dropdownRef}>
                    <label htmlFor="country">Country</label>
                    <div className="custom-select">
                        <input
                            type="text"
                            name="country"
                            className="country-input"
                            placeholder="Search and select country"
                            value={formData.country || searchQuery}
                            onClick={() => setIsCountryDropdownOpen(true)}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setIsCountryDropdownOpen(true);
                            }}
                            required
                        />
                        {isCountryDropdownOpen && (
                            <div className="country-dropdown">
                                {filteredCountries.map((country, index) => (
                                    <div
                                        key={index}
                                        className="country-option"
                                        onClick={() => handleCountrySelect(country)}
                                    >
                                        {country}
                                    </div>
                                ))}
                                {filteredCountries.length === 0 && (
                                    <div className="no-results">No countries found</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="Enter your message"
                        rows="5"
                    />
                </div>

                <button type="submit" className="submit-btn">
                    Send Message
                </button>
            </form>
        </div>
    );
};

export default Contactus;