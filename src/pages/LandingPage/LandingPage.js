import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import { ADMIN_SHORTS_VIDEO, ADMIN_TESTIMONIALS, ADMIN_UPLOADS, ADMIN_BANNER_UPLOADS } from '../../helper/Apihelpers';
import { COURSES } from '../../helper/Apihelpers';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import SocialStatsPage from '../SocialStats/SocialState';
import HomePage2 from '../HomePage_Why_Choose_us/HomePage2';

const LandingPage = () => {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [availableCourses, setAvailableCourses] = useState([]);
    const [expiredCourses, setExpiredCourses] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [testimonialPage, setTestimonialPage] = useState(1);
    const [totalTestimonialPages, setTotalTestimonialPages] = useState(0);
    const [loadingTestimonials, setLoadingTestimonials] = useState(false);
    const navigate = useNavigate();

    const [videos, setVideos] = useState([]);
    const [banners, setBanners] = useState([]);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setLoading(true);
                const response = await fetch(ADMIN_SHORTS_VIDEO);
                if (!response.ok) {
                    throw new Error('Failed to fetch videos');
                }
                const data = await response.json();
                setVideos(Array.isArray(data) ? data : []);
                setError('');
            } catch (error) {
                setError('Unable to load videos at this time');
                console.error('Error fetching videos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

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

    const fetchTestimonials = async (page = 1) => {
        setLoadingTestimonials(true);
        try {
            const response = await axios.get(ADMIN_TESTIMONIALS);
            const { testimonials, totalPages } = response.data.data;
            setTestimonials(testimonials);
            setTotalTestimonialPages(totalPages);
        } catch (err) {
            console.error('Error fetching testimonials:', err);
            setError('Failed to load testimonials');
        } finally {
            setLoadingTestimonials(false);
        }
    };

    useEffect(() => {
        fetchCourses();
        fetchTestimonials();
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const response = await axios.get(ADMIN_BANNER_UPLOADS);
            setBanners(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching banners:", error);
            setLoading(false);
        }
    };

    const sliderSettings = {
        infinite: banners.length > 1,
        speed: 1000,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: banners.length > 1,
        autoplaySpeed: 2500,
        adaptiveHeight: false
    };


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

    const handleBannerClick = (link) => {
        if (!link || link === '#') return;

        if (link.startsWith('http') || link.startsWith('https')) {
            // For external links
            window.open(link, '_blank', 'noopener noreferrer');
        } else {
            // For internal routes
            navigate(link);
        }
    };

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
                            <h1 className="page-uppertitle" >{content.upperTitle}</h1>
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

            <SocialStatsPage />
            <HomePage2 />

            <section>
                <div className="banner-slider-container">
                    <Slider {...sliderSettings}>
                        {banners.map((banner) => (
                            <div
                                key={banner._id}
                                className="banner-slide"
                                onClick={() => handleBannerClick(banner.link)}
                                style={{ cursor: banner.link ? 'pointer' : 'default' }}
                            >
                                <img
                                    src={banner.bannerUrl}
                                    alt="Banner"
                                    className="banner-image"
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        maxHeight: '300px',
                                        objectFit: 'cover',
                                        cursor: 'pointer'
                                    }}
                                />
                            </div>
                        ))}
                    </Slider>
                </div>
            </section>
            <section className="courses-section">
                <h2 className="section-title">Available Courses</h2>
                {availableCourses.length > 0 ? (
                    <div className="courses-grid">
                        {availableCourses.map((course) => (
                            <div key={course._id} className="course-card">
                                <div className="course-header">
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
                                        ${course.price.toFixed(2)}
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
            <section className="testimonials-section">
                <h2 className="section-title">Testimonials</h2>
                {loadingTestimonials ? (
                    <div className="loading">Loading testimonials...</div>
                ) : testimonials.length > 0 ? (
                    <>
                        <div className="testimonials-grid">
                            {testimonials.map((testimonial) => (
                                <div key={testimonial._id} className="testimonial-card">
                                    <div className="testimonial-content">
                                        {testimonial.courseName && (
                                            <span className="testimonial-course">
                                                {testimonial.courseName}
                                            </span>
                                        )}
                                        <p className="testimonial-text">{testimonial.comment}</p>
                                        <div className="testimonial-author">
                                            <strong>{testimonial.name}</strong>
                                            <p>{testimonial.profession}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="no-testimonials">No testimonials available.</div>
                )}
            </section>

            <section>
                <div className="videos-wrapper">
                    <div className="videos-grid">
                        {videos.map((video, index) => (
                            <div key={video._id || index} className="video-container">
                                <div dangerouslySetInnerHTML={{ __html: video.embedCode }} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;