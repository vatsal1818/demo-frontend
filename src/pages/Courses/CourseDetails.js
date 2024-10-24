import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { COURSES } from '../../helper/Apihelpers';
import '../Payment/PaymentModel.css';
import PaymentModal from '../Payment/PaymentModel';

const CourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    useEffect(() => {
        fetchCourseDetails();
    }, [courseId]);

    const fetchCourseDetails = async () => {
        try {
            const response = await fetch(`${COURSES}/${courseId}`);
            if (!response.ok) throw new Error('Failed to fetch course details');
            const data = await response.json();
            setCourse(data.data);
        } catch (err) {
            setError('Error loading course details');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = (data) => {
        // Show success message (you could add a toast notification library here)
        alert('Purchase successful! Redirecting to course content...');
        navigate(`/my-courses`);
    };

    const handlePaymentError = (error) => {
        // Show error message
        alert('Payment failed. Please try again or contact support.');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 text-center p-4">
                {error}
            </div>
        );
    }

    if (!course) return null;

    return (
        <div className="course-detail-container">
            <div className="back-button-container">
                <button
                    onClick={() => navigate('/courses')}
                    className="back-button"
                >
                    <ChevronLeft size={20} />
                    <span>Back to Courses</span>
                </button>
            </div>

            <div className="course-detail-header">
                <h1 className="course-detail-title">{course.courseName}</h1>
            </div>

            <div className="content-grid">
                {course.content?.map((content, index) => (
                    <div key={index} className="content-card">
                        <img
                            src={content.thumbnailUrl}
                            alt={content.title}
                            className="content-thumbnail"
                        />
                        <div className="content-info">
                            <h3 className="content-title">{content.title}</h3>
                            <p className="content-description">{content.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="purchase-bar">
                <div className="purchase-container">
                    <div className="purchase-price">
                        ${course.price.toFixed(2)}
                    </div>
                    <button
                        onClick={() => setShowPaymentModal(true)}
                        className="purchase-button"
                    >
                        Buy Course
                    </button>
                </div>
            </div>

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                course={course}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
            />
        </div>
    );
};

export default CourseDetail;