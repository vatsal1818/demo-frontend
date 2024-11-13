import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, AlertCircle, Clock } from 'lucide-react';
import { PURCHASED_COURSES } from '../../helper/Apihelpers';
import './PurchasedCourse.css';

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

            if (!response.ok) {
                throw new Error('Failed to fetch purchases');
            }

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
            return purchase.course &&
                !purchase.course.isDeleted &&
                purchase.course.isActive &&
                purchase.course.courseName &&
                purchase.course._id &&
                purchase.course.content?.length > 0 &&
                purchase.accessStatus?.isActive;
        });
    };

    const getInactivePurchases = () => {
        return purchases.filter(purchase => {
            return purchase.course &&
                !purchase.course.isDeleted &&
                (!purchase.course.isActive || purchase.accessStatus?.isExpired);
        });
    };

    const getValidityStatus = (purchase) => {
        if (purchase.accessStatus?.isExpired) {
            return {
                label: 'Expired',
                className: 'status-badge expired'
            };
        }

        const remainingDays = purchase.accessStatus?.remainingDays;
        if (remainingDays <= 30) {
            return {
                label: `${remainingDays} days left`,
                className: 'status-badge expiring-soon'
            };
        }

        return {
            label: `${Math.floor(remainingDays / 30)} months left`,
            className: 'status-badge active'
        };
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
    const inactivePurchases = getInactivePurchases();

    return (
        <div className="purchased-courses-container">
            <div className="purchased-courses-header">
                <h1 className="purchased-courses-title">My Courses</h1>
                <p className="purchased-courses-subtitle">Access your purchased course content</p>
            </div>

            {validPurchases.length > 0 && (
                <>
                    <h2 className="section-header">Active Courses</h2>
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
                                    <h3 className="course-title">
                                        {purchase.course.courseName}
                                    </h3>
                                    <div className="purchase-date">
                                        <Calendar size={16} className="purchase-date-icon" />
                                        <span className="course-meta">
                                            Purchased on: {new Date(purchase.purchaseDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="validity">
                                        <Clock size={16} className="icon" />
                                        <span className={getValidityStatus(purchase).className}>
                                            {getValidityStatus(purchase).label}
                                        </span>
                                    </div>
                                    <div className="expiry-date">
                                        <AlertCircle size={16} className="icon" />
                                        <span className="course-meta">
                                            Expires: {new Date(purchase.validityExpiryDate).toLocaleDateString()}
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
                </>
            )}

            {inactivePurchases.length > 0 && (
                <>
                    <h2 className="section-header">Temporarily Unavailable Courses</h2>
                    <div className="inactive-notice">
                        <AlertCircle size={20} />
                        <p>These courses are temporarily unavailable. Please contact support for more information.</p>
                    </div>
                    <div className="courses-grid">
                        {inactivePurchases.map((purchase) => (
                            <div key={purchase._id} className="course-card inactive-course">
                                {purchase.course.content[0]?.thumbnailUrl && (
                                    <img
                                        src={purchase.course.content[0].thumbnailUrl}
                                        alt={purchase.course.courseName}
                                        className="course-thumbnail"
                                    />
                                )}
                                <div className="course-content">
                                    <h3 className="course-title">
                                        {purchase.course.courseName}
                                    </h3>
                                    <div className="purchase-date">
                                        <Calendar size={16} className="icon" />
                                        <span className="course-meta">
                                            Purchased: {new Date(purchase.purchaseDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="expiry-date">
                                        <AlertCircle size={16} className="icon" />
                                        <span className="course-meta">
                                            {purchase.accessStatus?.isExpired ? 'Expired on: ' : 'Expires: '}
                                            {new Date(purchase.validityExpiryDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <span className="status-badge inactive">Currently Unavailable</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {validPurchases.length === 0 && inactivePurchases.length === 0 && (
                <div className="empty-state">
                    <p className="empty-state-message">You haven't purchased any courses yet.</p>
                    <Link to="/courses" className="browse-courses-link">
                        Browse Courses
                    </Link>
                </div>
            )}
        </div>
    );
};

export default PurchasedCourses;