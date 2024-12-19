import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, FileText, PaperclipIcon, Trash2, Maximize } from 'lucide-react';
import AttachmentsList from './AttachmentDownload';
import CourseVideoWatermark from './CourseVideoWatermark';
import { COURSES } from '../../helper/Apihelpers';

const TabButton = ({ contentId, tabName, icon: Icon, isActive, onClick }) => (
    <button
        className={`tab-button ${isActive ? 'active' : ''}`}
        onClick={onClick}
    >
        <Icon size={18} />
        <span>{tabName}</span>
    </button>
);

const CourseListItem = ({
    content,
    userData,
    courseId,
    handleVideoPlay,
    accessToken
}) => {
    const [activeTab, setActiveTab] = useState('description');
    const [isCommenting, setIsCommenting] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const videoRef = useRef(null);

    useEffect(() => {
        fetchComments();
    }, [content._id]);

    const fetchComments = async () => {
        try {
            const response = await fetch(`${COURSES}/${courseId}/content/${content._id}/comments`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch comments');
            }

            const data = await response.json();
            setComments(data.data || []);
        } catch (err) {
            console.error('Error fetching comments:', err);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();

        if (!newComment.trim()) return;

        try {
            const response = await fetch(`${COURSES}/${courseId}/content/${content._id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                credentials: 'include',
                body: JSON.stringify({ content: newComment.trim() })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to post comment');
            }

            // Fetch updated comments after successful submission
            await fetchComments();

            // Reset comment input
            setNewComment('');
            setIsCommenting(false);
        } catch (err) {
            console.error('Error posting comment:', err);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;

        try {
            const response = await fetch(`${COURSES}/${courseId}/content/${content._id}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete comment');
            }

            // Refetch comments after deletion
            await fetchComments();
        } catch (err) {
            console.error('Error deleting comment:', err);
        }
    };

    const toggleFullscreen = () => {
        const videoContainer = document.getElementById('vid-cont');
        if (videoContainer) {
            if (!document.fullscreenElement) {
                videoContainer.requestFullscreen().catch(err => {
                    console.error('Error attempting to enable fullscreen:', err);
                });
            } else if (document.exitFullscreen) {
                document.exitFullscreen().catch(err => {
                    console.error('Error attempting to exit fullscreen:', err);
                });
            }
        }
    };

    useEffect(() => {
        const videoElement = videoRef.current;

        const handleNativeFullscreenRequest = (e) => {
            // Ensure this is a direct user interaction
            if (e.isTrusted) {
                toggleFullscreen();
            }
        };

        if (videoElement) {
            videoElement.addEventListener('webkitfullscreenchange', handleNativeFullscreenRequest);
            videoElement.addEventListener('fullscreenchange', handleNativeFullscreenRequest);
        }

        return () => {
            if (videoElement) {
                videoElement.removeEventListener('webkitfullscreenchange', handleNativeFullscreenRequest);
                videoElement.removeEventListener('fullscreenchange', handleNativeFullscreenRequest);
            }
        };
    }, [toggleFullscreen]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    return (
        <div className="content-item">
            <div className="content-item-header">
                <h4>{content.title}</h4>
            </div>

            <div id="vid-cont" className="video-container">
                <video
                    ref={videoRef}
                    controls
                    className={`content-video ${isFullscreen ? 'fullscreen-video' : 'normal-video'}`}
                    poster={content.thumbnailUrl}
                    onPlay={() => handleVideoPlay(videoRef.current)}
                    controlsList="nodownload noplaybackrate"
                    disablePictureInPicture
                    onContextMenu={(e) => e.preventDefault()}
                    onDoubleClick={(e) => e.preventDefault()}
                >
                    <source
                        src={`${content.videoUrl}?token=${encodeURIComponent(accessToken)}`}
                        type="video/mp4"
                    />
                    Your browser does not support the video tag.
                </video>

                <CourseVideoWatermark userData={userData} />
                <button
                    className="fullscreen-button"
                    onClick={toggleFullscreen}
                >
                    {!isFullscreen ? (
                        <Maximize size={16} />
                    ) : (
                        <Maximize size={22} />
                    )}
                </button>
            </div>

            <div className="content-tabs">
                <TabButton
                    contentId={content._id}
                    tabName="Description"
                    icon={FileText}
                    isActive={activeTab === 'description'}
                    onClick={() => setActiveTab('description')}
                />
                <TabButton
                    contentId={content._id}
                    tabName="Comments"
                    icon={MessageSquare}
                    isActive={activeTab === 'comments'}
                    onClick={() => setActiveTab('comments')}
                />
                {content.attachments?.length > 0 && (
                    <TabButton
                        contentId={content._id}
                        tabName="Attachments"
                        icon={PaperclipIcon}
                        isActive={activeTab === 'attachments'}
                        onClick={() => setActiveTab('attachments')}
                    />
                )}
            </div>

            <div className="tab-content">
                {activeTab === 'description' && (
                    <div className="description-section">
                        <p>{content.description}</p>
                    </div>
                )}

                {activeTab === 'comments' && (
                    <div className="comments-section">
                        <div className="comments-header">
                            <h3>Comments for this video</h3>
                            <button
                                className="add-comment-btn"
                                onClick={() => setIsCommenting(!isCommenting)}
                            >
                                <MessageSquare size={18} />
                                {isCommenting ? 'Cancel' : 'Add Comment'}
                            </button>
                        </div>
                        {isCommenting && (
                            <form
                                onSubmit={handleSubmitComment}
                                className="comment-form"
                            >
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write your comment here..."
                                    required
                                    className="comment-input"
                                    maxLength={1000}
                                />
                                <div className="comment-actions">
                                    <button type="submit" className="submit-comment-btn">
                                        Post Comment
                                    </button>
                                </div>
                            </form>
                        )}
                        <div className="comments-list">
                            {comments.map((comment) => (
                                <div key={comment._id} className="comment-item">
                                    <div className="comment-header">
                                        <span className="comment-author">
                                            {comment.user?.username || userData?.username || 'Unknown User'}
                                        </span>
                                        <span className="comment-date">
                                            {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                    <p className="comment-content">{comment.content}</p>
                                    {comment.user?.username === userData?.username && (
                                        <button
                                            onClick={() => handleDeleteComment(comment._id)}
                                            className="delete-comment-btn"
                                            title="Delete comment"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                    {comment.adminReply && (
                                        <div className="admin-reply-container">
                                            <div className="admin-reply-header">
                                                <span className="comment-author">Admin Reply</span>
                                                <span className="comment-date">
                                                    {new Date(comment.adminReply.repliedAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                            <p className="admin-reply-content">
                                                {comment.adminReply.content}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {comments.length === 0 && (
                                <p className="no-comments">No comments yet. Be the first to comment!</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'attachments' && content.attachments?.length > 0 && (
                    <div className="attachments-section">
                        <AttachmentsList attachments={content.attachments} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseListItem;