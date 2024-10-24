import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { PURCHASED_COURSES } from '../../helper/Apihelpers';

const PurchasedCourses = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPurchasedCourses();
    }, []);

    const fetchPurchasedCourses = async () => {
        try {
            const response = await fetch(PURCHASED_COURSES, {
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to fetch purchases');

            const data = await response.json();
            setPurchases(data.data);
        } catch (err) {
            setError('Error loading purchased courses');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getValidPurchases = () => {
        return purchases.filter(purchase => {
            // Check if course exists and is not deleted
            const isValidCourse = purchase.course &&
                !purchase.course.isDeleted &&
                purchase.course.courseName &&
                purchase.course._id;

            // Check if course has valid content
            const hasValidContent = purchase.course?.content?.length > 0;

            return isValidCourse && hasValidContent;
        });
    };

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    const validPurchases = getValidPurchases();

    return (
        <div className="purchased-courses-container">
            <div className="purchased-courses-header">
                <h1 className="purchased-courses-title">My Courses</h1>
                <p className="purchased-courses-subtitle">Access your purchased course content</p>
            </div>

            {validPurchases.length === 0 ? (
                <div className="empty-state">
                    <p className="empty-state-message">You haven't purchased any courses yet.</p>
                    <Link to="/courses" className="browse-courses-link">
                        Browse Courses
                    </Link>
                </div>
            ) : (
                <div className="courses-grid">
                    {validPurchases.map((purchase) => (
                        <div key={purchase._id} className="course-card">
                            {purchase.course.content[0]?.thumbnailUrl && (
                                <img
                                    src={purchase.course.content[0].thumbnailUrl}
                                    alt={purchase.course.courseName}
                                    className="course-thumbnail"
                                />
                            )}
                            <div className="course-content">
                                <h2 className="course-title">
                                    {purchase.course.courseName}
                                </h2>
                                <div className="purchase-date">
                                    <Calendar size={16} className="purchase-date-icon" />
                                    <span className="course-meta">
                                        Purchased on: {new Date(purchase.purchaseDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <button
                                    onClick={() => navigate(`/courses/${purchase.course._id}/content`)}
                                    className="view-content-btn"
                                >
                                    View Content
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PurchasedCourses;