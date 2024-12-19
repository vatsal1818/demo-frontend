import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CourseList.css';
import { COURSES } from '../../helper/Apihelpers';

const CourseList = () => {
    const [availableCourses, setAvailableCourses] = useState([]);
    const [expiredCourses, setExpiredCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await fetch(COURSES);
            if (!response.ok) throw new Error('Failed to fetch courses');
            const data = await response.json();

            const now = new Date();
            const available = [];
            const expired = [];

            data.data.forEach(course => {
                if (!course.expiryDate || new Date(course.expiryDate) > now) {
                    available.push(course);
                } else {
                    expired.push(course);
                }
            });

            setAvailableCourses(available);
            setExpiredCourses(expired);
        } catch (err) {
            setError('Error loading courses');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatExpiryDate = (expiryDate) => {
        if (!expiryDate) return 'No expiry date';
        const date = new Date(expiryDate);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatValidityPeriod = (validityPeriod) => {
        if (!validityPeriod || (!validityPeriod.duration && !validityPeriod.unit)) {
            return 'Lifetime access';
        }

        const { duration, unit } = validityPeriod;
        let validityText = '';

        switch (unit) {
            case 'days':
                validityText = `${duration} day${duration > 1 ? 's' : ''}`;
                break;
            case 'months':
                validityText = `${duration} month${duration > 1 ? 's' : ''}`;
                break;
            case 'years':
                validityText = `${duration} year${duration > 1 ? 's' : ''}`;
                break;
            default:
                validityText = 'Lifetime access';
        }

        return validityText;
    };

    const getExpiryClass = (expiryDate) => {
        if (!expiryDate) return 'expiry-normal';
        const now = new Date();
        const expiry = new Date(expiryDate);
        const daysToExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

        if (daysToExpiry < 0) return 'expiry-expired';
        if (daysToExpiry <= 30) return 'expiry-warning';
        return 'expiry-normal';
    };

    const calculateDiscountPercentage = (price, offerPrice) => {
        if (!price || !offerPrice) return null;
        const discount = ((price - offerPrice) / price) * 100;
        return Math.round(discount); // Round to nearest whole number
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="courses-container">
            <h1 className="main-title">Courses</h1>

            {/* Available Courses Section */}
            <section className="courses-section">
                <h2 className="section-title">Available Courses</h2>
                {availableCourses.length > 0 ? (
                    <div className="courses-grid">
                        {availableCourses.map((course) => (
                            <div key={course._id} className="course-card">
                                <div className="course-header">
                                    <img
                                        src={course.courseThumbnailUrl}
                                        alt={course.courseName}
                                        className="content-thumbnail"
                                    />
                                    <h3 className="course-name">{course.courseName}</h3>
                                    <div className={`expiry-badge ${getExpiryClass(course.expiryDate)}`}>
                                        {course.expiryDate ? `Expires: ${formatExpiryDate(course.expiryDate)}` : 'Always Available'}
                                    </div>
                                </div>

                                <div className="course-content">
                                    <div className="validity-info">
                                        <i className="clock-icon"></i>
                                        <span>Access period: {formatValidityPeriod(course.validityPeriod)}</span>
                                    </div>
                                </div>

                                <div className="course-footer">
                                    <div className="course-price">
                                        {course.offerPrice ? (
                                            <div className="price-container">
                                                <span className="original-price">${course.price.toFixed(2)}</span>
                                                <span className="offer-price">${course.offerPrice.toFixed(2)}</span>
                                                <span className="discount-percentage">
                                                    ({calculateDiscountPercentage(course.price, course.offerPrice)}% off)
                                                </span>
                                            </div>
                                        ) : (
                                            <span>${course.price.toFixed(2)}</span>
                                        )}
                                    </div>
                                    <div className="course-actions">
                                        <button
                                            className="btn btn-view"
                                            onClick={() => navigate(`/courses/${course._id}`)}
                                        >
                                            View Course
                                        </button>
                                        <button
                                            className="btn btn-buy"
                                            onClick={() => navigate(`/courses/${course._id}?buy=true`)}
                                        >
                                            Buy Course
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-courses-message">No available courses at the moment.</div>
                )}
            </section>

            {/* Expired Courses Section */}
            {expiredCourses.length > 0 && (
                <section className="courses-section">
                    <h2 className="section-title">Expired Courses</h2>
                    <div className="courses-grid">
                        {expiredCourses.map((course) => (
                            <div key={course._id} className="course-card expired">
                                <div className="course-header">
                                    <h3 className="course-name">{course.courseName}</h3>
                                    <div className="expiry-badge expiry-expired">
                                        Expired on: {formatExpiryDate(course.expiryDate)}
                                    </div>
                                </div>

                                <div className="course-content">
                                    <div className="validity-info">
                                        <i className="clock-icon"></i>
                                        <span>Access period: {formatValidityPeriod(course.validityPeriod)}</span>
                                    </div>
                                </div>

                                <div className="course-footer">
                                    <div className="course-price">
                                        {course.offerPrice ? (
                                            <div>
                                                <div className="price-container">
                                                    <span className="original-price">${course.price.toFixed(2)}</span>
                                                    <span className="offer-price">${course.offerPrice.toFixed(2)}</span>
                                                </div>
                                                <div>
                                                    <span className="discount-percentage">
                                                        ({calculateDiscountPercentage(course.price, course.offerPrice)}% off)
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <span>${course.price.toFixed(2)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default CourseList;