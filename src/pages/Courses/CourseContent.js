import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, ArrowLeft, Shield } from 'lucide-react';
import { COURSES } from '../../helper/Apihelpers';
import "./PurchasedCourse.css";

const CourseContent = () => {
    const [courseContent, setCourseContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { courseId } = useParams();
    const navigate = useNavigate();
    const videoRefs = useRef([]);

    useEffect(() => {
        // Prevent right-click on the entire page
        const handleContextMenu = (e) => {
            e.preventDefault();
            return false;
        };

        // Prevent keyboard shortcuts
        const handleKeyDown = (e) => {
            // Block PrintScreen and Snipping Tool shortcuts
            if (
                (e.ctrlKey && (e.key === 'p' || e.key === 's' || e.key === 'u' || e.key === 'i')) ||
                ((e.ctrlKey && e.shiftKey) && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
                (e.keyCode === 123) || // F12
                (e.keyCode === 44) ||  // PrintScreen
                (e.key === 'PrintScreen') ||
                (e.metaKey && e.shiftKey && e.key === '4') || // Mac screenshot
                (e.keyCode === 83 && e.key === 'F19') ||
                // Windows Snipping Tool shortcuts
                (e.shiftKey && (e.key === 'PrintScreen' || e.keyCode === 44)) ||
                (e.winKey && e.shiftKey && e.key === 's') ||
                (e.windowsKey && e.shiftKey && e.key === 's') ||
                // Block Windows + Shift + S
                ((e.key === 's' || e.keyCode === 83) && e.shiftKey && (e.metaKey || e.windowsKey))
            ) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };

        // Function to disable cut/copy/paste
        const disableCutCopyPaste = (e) => {
            e.preventDefault();
            return false;
        };

        // Add event listeners
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyDown);
        document.addEventListener('copy', disableCutCopyPaste);
        document.addEventListener('cut', disableCutCopyPaste);
        document.addEventListener('paste', disableCutCopyPaste);

        // Additional protection for Windows shortcuts
        window.addEventListener('keydown', function (e) {
            if (e.key === 'Meta' || e.key === 'Win' || e.keyCode === 91 || e.keyCode === 92) {
                document.addEventListener('keydown', function (e2) {
                    if (e2.shiftKey && (e2.key === 's' || e2.keyCode === 83)) {
                        e2.preventDefault();
                        e2.stopPropagation();
                        return false;
                    }
                });
            }
        });

        // Cleanup
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyDown);
            document.removeEventListener('copy', disableCutCopyPaste);
            document.removeEventListener('cut', disableCutCopyPaste);
            document.removeEventListener('paste', disableCutCopyPaste);
        };
    }, [navigate]);


    useEffect(() => {
        fetchCourseContent();

        // Add listener for visibility change
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Pause all videos when tab is not visible
                videoRefs.current.forEach(video => {
                    if (video) video.pause();
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
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

    const handleVideoPlay = (index) => {
        // Ensure only one video plays at a time
        videoRefs.current.forEach((video, i) => {
            if (i !== index && video) {
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
                <button
                    onClick={() => navigate('/my-courses')}
                    className="back-button"
                >
                    <ArrowLeft size={20} />
                    Back to My Courses
                </button>
                <h1>{courseContent?.courseName}</h1>
                <div className="security-badge">
                    <Shield size={16} />
                    <span>Protected Content</span>
                </div>
            </div>
            <div className="content-list">
                {courseContent?.content.map((content, index) => (
                    <div key={index} className="content-item">
                        <div className="content-item-header">
                            <Play size={16} className="play-icon" />
                            <h4>{content.title}</h4>
                        </div>
                        <p>{content.description}</p>
                        <div className="video-container">
                            <video
                                ref={el => videoRefs.current[index] = el}
                                controls
                                className="content-video"
                                poster={content.thumbnailUrl}
                                onPlay={() => handleVideoPlay(index)}
                                controlsList="nodownload noplaybackrate"
                                disablePictureInPicture
                                onContextMenu={e => e.preventDefault()}
                            >
                                <source
                                    src={`${content.videoUrl}?token=${encodeURIComponent(localStorage.getItem('authToken'))}`}
                                    type="video/mp4"
                                />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CourseContent;