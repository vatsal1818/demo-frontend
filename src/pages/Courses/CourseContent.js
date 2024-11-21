import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Trash2 } from 'lucide-react';
import { COURSES } from '../../helper/Apihelpers';
import "./PurchasedCourse.css";

const CourseContent = () => {
    const [courseContent, setCourseContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isCommenting, setIsCommenting] = useState(false);
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

    const fetchComments = async () => {
        try {
            const response = await fetch(`${COURSES}/${courseId}/comments`, {
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch comments');
            }

            const data = await response.json();
            setComments(data.data);
        } catch (err) {
            console.error('Error fetching comments:', err);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${COURSES}/${courseId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                credentials: 'include',
                body: JSON.stringify({ content: newComment })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to post comment');
            }

            const data = await response.json();
            setComments(prevComments => [...prevComments, data.data]);
            setNewComment('');
            setIsCommenting(false);
        } catch (err) {
            console.error('Error posting comment:', err);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;

        try {
            const response = await fetch(`${COURSES}/${courseId}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete comment');
            }

            setComments(prevComments =>
                prevComments.filter(comment => comment._id !== commentId)
            );
        } catch (err) {
            console.error('Error deleting comment:', err);
        }
    };


    useEffect(() => {
        if (courseId) {
            fetchComments();
        }
    }, [courseId]);


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
                    <ArrowLeft size={18} />
                    Back to My Courses
                </button>
                <h1>{courseContent?.courseName}</h1>
                <button
                    onClick={() => navigate('/added-content')}
                    className="content-button"
                >
                    Content
                </button>
            </div>

            <div className="content-list">
                {courseContent?.content.map((content, index) => (
                    <div key={index} className="content-item">
                        <div className="content-item-header">
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

            <div className="course-description">
                <h2>{courseContent?.courseDescription}</h2>
            </div>

            {/* Comments Section */}
            <div className="comments-section">
                <div className="comments-header">
                    <h3>Comments</h3>
                    <button
                        className="add-comment-btn"
                        onClick={() => setIsCommenting(!isCommenting)}
                    >
                        <MessageSquare size={18} />
                        {isCommenting ? 'Cancel' : 'Add Comment'}
                    </button>
                </div>

                {isCommenting && (
                    <form onSubmit={handleSubmitComment} className="comment-form">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write your comment here..."
                            required
                            className="comment-input"
                            maxLength={1000} // Optional: add maximum length
                        />
                        <div className="comment-actions">
                            <button type="submit" className="submit-comment-btn">
                                Post Comment
                            </button>
                        </div>
                    </form>
                )}

                <div className="comments-list">
                    {comments.map(comment => (
                        <div key={comment._id} className="comment-item">
                            <div className="comment-header">
                                <span className="comment-author">
                                    {comment.user?.username || 'Unknown User'}
                                </span>
                                <span className="comment-date">
                                    {new Date(comment.createdAt || comment.timestamp).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            <p className="comment-content">{comment.content}</p>
                            <button
                                onClick={() => handleDeleteComment(comment._id)}
                                className="delete-comment-btn"
                                title="Delete comment"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    {comments.length === 0 && (
                        <p className="no-comments">No comments yet. Be the first to comment!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseContent;