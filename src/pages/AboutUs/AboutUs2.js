import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./AboutUs.css"
import { ADMIN_ABOUT_US_2 } from '../../helper/Apihelpers';

const AboutUs2 = () => {
    const [aboutContent, setAboutContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // Fetch both About Us
                const [aboutResponse] = await Promise.all([
                    axios.get(ADMIN_ABOUT_US_2)
                ]);

                setAboutContent(aboutResponse.data.data || aboutResponse.data);
            } catch (error) {
                console.error('Error details:', error.response || error);
                setError('Failed to load content');
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    if (loading) {
        return (
            <div className="loading">
                Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-message">
                {error}
            </div>
        );
    }

    return (
        <div className="user-container">
            {/* About Us Section */}
            {aboutContent && (
                <div className='main'>
                    <div className="left">
                        {aboutContent.imageUrl && (
                            <div className="image-container">
                                <img
                                    src={aboutContent.imageUrl}
                                    alt={aboutContent.title}
                                    className="content-image"
                                    onError={(e) => {
                                        console.error('Image failed to load');
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div className="right">
                        <h1 className="page-title">{aboutContent.title}
                            <span className="page-titleSpan">{aboutContent.titleSpan}</span>
                        </h1>
                        <p className='page-para'>{aboutContent.paragraph}</p>
                        <p className="page-experience">{aboutContent.experience}<br />
                            <span className="page-experience-span">{aboutContent.experienceSpan}</span>
                        </p>

                        <button className='page-button'>{aboutContent.button}</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AboutUs2;