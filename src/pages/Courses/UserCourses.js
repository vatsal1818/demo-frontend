import React, { useState, useEffect } from "react";
import "./UserCourses.css";
import { COURSES } from "../../helper/Apihelpers";
import { useNavigate } from "react-router-dom";

const UserCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch(COURSES);
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }
      const data = await response.json();
      setCourses(data.data);
    } catch (err) {
      setError("Error loading courses");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (courseId) => {
    try {
      // Your purchase logic here
      // After successful purchase:
      navigate("/my-courses");
    } catch (error) {
      // Handle error
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
    <div className="courses-container">
      <h1 className="courses-title">Available Courses</h1>
      <div className="courses-grid">
        {courses.map((course) => (
          <div key={course._id} className="course-card">
            <div className="course-header">
              <h2 className="course-title">{course.title}</h2>
              <p className="course-instructor">
                By {course.createdBy?.username || "Unknown Instructor"}
              </p>
            </div>

            <div className="course-content">
              {course.videoUrl && (
                <div className="video-container">
                  <video className="course-video">
                    <source src={course.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="play-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                </div>
              )}
              <p className="course-description">{course.description}</p>
            </div>

            <div className="course-footer">
              <div className="course-price">${course.price.toFixed(2)}</div>
              <button
                className="purchase-button"
                onClick={() => handlePurchase(course._id)}
              >
                Purchase Course
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserCourses;
