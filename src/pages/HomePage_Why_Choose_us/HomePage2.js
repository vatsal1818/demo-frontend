import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HomePage2.css';
import { HOME_WHY_CHOOSE_US } from '../../helper/Apihelpers';

const HomePage2 = () => {
    const [content, setContent] = useState({
        title: '',
        paragraph: '',
        imageUrl: '',
        sections: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const response = await axios.get(HOME_WHY_CHOOSE_US);
            setContent(response.data);
        } catch (err) {
            console.error('Error fetching content:', err);
            setError('Failed to fetch content');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading content...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="admin-page-2">
            <div className="header">
                {content.imageUrl && (
                    <img src={content.imageUrl} alt="Header" className="header-image" />
                )}

            </div>

            <div className="sections">
                <div>
                    <h1 className="title">{content.title}</h1>
                    <p className="paragraph">{content.paragraph}</p>
                </div>
                <div>
                    {content.sections.map((section, index) => (
                        <div key={index} className="section-card">
                            <div>
                                {section.iconImage && (
                                    <img src={section.iconImage} alt={section.title} className="icon-image" />
                                )}
                            </div>
                            <div>
                                <h3 className="section-title">{section.sectionTitle}</h3>
                                <p className="section-description">{section.sectionParagraph}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomePage2;
