import React from "react";
import { useState } from "react";

const CourseViewer = ({ course, onClose, onProgressUpdate }) => {
  const [currentProgress, setCurrentProgress] = useState(course.progress || 0);

  const handleVideoProgress = (e) => {
    const video = e.target;
    const progress = (video.currentTime / video.duration) * 100;
    setCurrentProgress(progress);
    onProgressUpdate(progress);
  };

  return (
    <div className="course-viewer">
      <div className="viewer-header">
        <h2>{course.title}</h2>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="video-section">
        <div className="video-container">
          <video
            className="course-video"
            controls
            onTimeUpdate={handleVideoProgress}
          >
            <source src={course.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="course-sidebar">
          <div className="course-info">
            <h3>Course Progress</h3>
            <div className="progress-container">
              <div
                className="progress-bar"
                style={{ width: `${currentProgress}%` }}
              ></div>
            </div>
            <p className="completion-status">
              {Math.round(currentProgress)}% Complete
            </p>
          </div>

          <div className="course-content">
            <h3>Course Description</h3>
            <p>{course.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;
