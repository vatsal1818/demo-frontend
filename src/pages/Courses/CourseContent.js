import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, ArrowLeft } from 'lucide-react';
import { COURSES } from '../../helper/Apihelpers';
import "./PurchasedCourse.css"

const CourseContent = () => {
    const [courseContent, setCourseContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { courseId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourseContent();
    }, [courseId]);

    const fetchCourseContent = async () => {
        try {
            const response = await fetch(`${COURSES}/${courseId}`, {
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to fetch course content');

            const data = await response.json();
            setCourseContent(data.data);
        } catch (err) {
            setError('Error loading course content');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
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

    return (
        <div className="course-content-page">
            <div className="content-header">
                <button
                    onClick={() => navigate('/my-courses')}
                    className="back-button"
                >
                    <ArrowLeft size={20} />
                    Back to My Courses
                </button>
                <h1>{courseContent?.courseName}</h1>
            </div>
            <div className="content-list">
                {courseContent?.content.map((content, index) => (
                    <div key={index} className="content-item">
                        <div className="content-item-header">
                            <Play size={16} className="play-icon" />
                            <h4>{content.title}</h4>
                        </div>
                        <p>{content.description}</p>
                        <video
                            controls
                            className="content-video"
                            poster={content.thumbnailUrl}
                        >
                            <source src={content.videoUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CourseContent;