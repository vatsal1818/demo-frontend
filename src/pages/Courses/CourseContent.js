import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { COURSES, GET_USER } from '../../helper/Apihelpers';
import "./PurchasedCourse.css";
import CourseListItem from './CourseListItem';
import { jwtDecode } from 'jwt-decode';

function getCookieValue(cookieName) {
    const cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
        const [name, value] = cookie.split('=');
        if (name === cookieName) {
            return decodeURIComponent(value);
        }
    }
    return null;
}

const CourseContent = () => {
    const [courseContent, setCourseContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState({ username: '', email: '' });
    const { courseId } = useParams();
    const navigate = useNavigate();
    const videoRefs = useRef([]);
    const accessToken = localStorage.getItem('accessToken');

    useEffect(() => {
        const token = getCookieValue('accessToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserData({
                    username: decodedToken.username,
                    email: decodedToken.email
                });
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }
    }, []);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch(GET_USER, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user profile');
                }

                const data = await response.json();
                setUserData(prev => ({
                    ...prev,
                    phoneNumber: data.phoneNumber
                }));
            } catch (err) {
                console.error('Error fetching user profile:', err);
            }
        };

        if (userData?.username) {
            fetchUserProfile();
        }
    }, [userData?.username]);

    useEffect(() => {
        fetchCourseContent();
    }, [courseId]);

    const fetchCourseContent = async () => {
        try {
            const response = await fetch(`${COURSES}/${courseId}`, {
                credentials: 'include',
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

    const handleVideoPlay = (currentVideo) => {
        videoRefs.current.forEach((video) => {
            if (video !== currentVideo && video) {
                video.pause();
            }
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

    return (
        <div className="course-content-page" style={{ userSelect: 'none' }}>
            <div className="content-header">
                <button onClick={() => navigate('/my-courses')} className="back-button">
                    <ArrowLeft size={18} />
                    Back to My Courses
                </button>
                <h1>{courseContent?.courseName}</h1>
                <button onClick={() => navigate('/added-content')} className="content-button">
                    Content
                </button>
            </div>

            <video
                src={courseContent?.courseVideoUrl}
                controls
                className="content-video"
                poster={courseContent?.courseThumbnailUrl}
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture
            />

            <div className="content-list">
                {courseContent?.content.map((content, index) => (
                    <CourseListItem
                        key={content._id}
                        content={content}
                        userData={userData}
                        courseId={courseId}
                        handleVideoPlay={handleVideoPlay}
                        accessToken={accessToken}
                    />
                ))}
            </div>

            <div className="course-description">
                <h2>{courseContent?.courseDescription}</h2>
            </div>
        </div>
    );
};

export default CourseContent;