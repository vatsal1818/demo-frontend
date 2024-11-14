import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LandingPage.css';
import { ADMIN_UPLOADS } from '../../helper/Apihelpers';

const LandingPage = () => {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await axios.get(ADMIN_UPLOADS);
                console.log('API Response:', response.data); // Debug response
                setContent(response.data.data || response.data);
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
            {content && (
                <>
                    <div className='main'>
                        <div className="left">
                            <h1 className="page-title">{content.title}</h1>
                            <p className='page-para'>{content.paragraph}</p>
                            <button className='page-button'>{content.button}</button>
                        </div>
                        <div className="right">
                            {content.imageUrl && (
                                <div className="image-container">
                                    <img
                                        src={content.imageUrl}
                                        alt={content.title}
                                        className="content-image"
                                        onError={(e) => {
                                            console.error('Image failed to load');
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LandingPage;