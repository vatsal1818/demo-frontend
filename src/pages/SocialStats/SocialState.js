import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ADMIN_SOCIAL_STATS } from '../../helper/Apihelpers';
import './SocialState.css';

const SocialStatsPage = () => {
    const [socialStats, setSocialStats] = useState({
        youtube: { title: 'YouTube Subscribers', count: 0 },
        instagram: { title: 'Instagram Followers', count: 0 },
        telegram: { title: 'Telegram Subscribers', count: 0 },
        playstore: { title: 'Play Store Downloads', count: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSocialStats();
    }, []);

    const fetchSocialStats = async () => {
        try {
            setLoading(true);
            const response = await axios.get(ADMIN_SOCIAL_STATS);

            // Filter out stats with 0 or empty count
            const filteredStats = Object.fromEntries(
                Object.entries(response.data).filter(
                    ([key, value]) =>
                        key !== 'createdAt' &&
                        key !== 'updatedAt' &&
                        value.count > 0
                )
            );

            setSocialStats(filteredStats);
            setError(null);
        } catch (error) {
            console.error('Error fetching social stats:', error);
            setError('Failed to load social stats');
        } finally {
            setLoading(false);
        }
    };

    // Color mapping for each platform
    const socialColors = {
        youtube: '#FF0000',
        instagram: '#E1306C',
        telegram: '#0088cc',
        playstore: '#34A853'
    };

    if (loading) {
        return <div className="loading">Loading social stats...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="social-stats-page">
            <div className="container">
                <div className="social-stats-grid">
                    {Object.entries(socialStats).map(([platform, { title, count }]) => (
                        <div
                            key={platform}
                            className="social-stats-card"
                            style={{
                                borderTop: `4px solid ${socialColors[platform]}`,
                                boxShadow: `0 4px 6px rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.1)`
                            }}
                        >
                            <div className="social-stats-content">
                                <p
                                    className="social-stats-count"
                                    style={{ color: socialColors[platform] }}
                                >
                                    {count}+
                                </p>
                                <h3 className="social-stats-title">{title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SocialStatsPage;