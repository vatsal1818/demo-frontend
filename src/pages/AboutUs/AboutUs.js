import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./AboutUs.css"
import { ADMIN_ABOUT_US, ADMIN_WHY_CHOOSE_US } from '../../helper/Apihelpers';

const AboutUs = () => {
    const [aboutContent, setAboutContent] = useState(null);
    const [whyChooseContent, setWhyChooseContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // Fetch both About Us and Why Choose Us content
                const [aboutResponse, whyChooseResponse] = await Promise.all([
                    axios.get(ADMIN_ABOUT_US),
                    axios.get(ADMIN_WHY_CHOOSE_US)
                ]);

                setAboutContent(aboutResponse.data.data || aboutResponse.data);
                setWhyChooseContent(whyChooseResponse.data.data || whyChooseResponse.data);
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
                        <h1 className="page-title">{aboutContent.title}</h1>
                        <p className='page-para'>{aboutContent.paragraph}</p>
                        <button className='page-button'>{aboutContent.button}</button>
                    </div>
                </div>
            )}

            {/* Why Choose Us Section */}
            {whyChooseContent && (
                <div className="why-choose-section">
                    <h2 className="why-choose-title">{whyChooseContent.title}</h2>
                    <div className="reasons-container">
                        {whyChooseContent.reasons?.map((reason, index) => (
                            <div key={index} className="reason-card">
                                <h3 className="reason-title">{reason.title}</h3>
                                <p className="reason-description">{reason.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AboutUs;