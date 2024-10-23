// MyCourses.jsx
import React, { useState, useEffect } from "react";
import "./MyCourses.css";
import CourseViewer from "./CourseViewer.js";
import { PURCHASED_COURSES } from "../../helper/Apihelpers.js";

const MyCourses = () => {
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const token = localStorage.getItem("accesToken");

  useEffect(() => {
    fetchPurchasedCourses();
  }, []);

  const fetchPurchasedCourses = async () => {
    try {
      // Replace with your API endpoint for fetching purchased courses
      const response = await fetch(PURCHASED_COURSES, {
        headers: {
          Authorization: `Bearer ${token}`, // Ensure token is sent like this
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch courses");

      const data = await response.json();
      setPurchasedCourses(data.data);
    } catch (err) {
      setError("Error loading your courses");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (course) => {
    // This should be replaced with actual progress tracking logic
    return course.progress || 0;
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
    <div className="my-courses-container">
      <h1 className="my-courses-title">My Courses</h1>
      <div className="my-courses-grid">
        {purchasedCourses.map((course) => (
          <div key={course._id} className="enrolled-course-card">
            <div className="enrolled-header">
              <h2 className="course-title">{course.title}</h2>
              <p className="course-instructor">
                By {course.createdBy?.username || "Unknown Instructor"}
              </p>
              <div className="progress-container">
                <div
                  className="progress-bar"
                  style={{ width: `${calculateProgress(course)}%` }}
                ></div>
              </div>
              <p className="completion-status">
                {calculateProgress(course)}% Complete
              </p>
            </div>
            <div className="course-content">
              <button
                className="continue-button"
                onClick={() => setSelectedCourse(course)}
              >
                Continue Learning
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedCourse && (
        <CourseViewer
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onProgressUpdate={(progress) => {
            // Update course progress
            setPurchasedCourses((courses) =>
              courses.map((c) =>
                c._id === selectedCourse._id ? { ...c, progress: progress } : c
              )
            );
          }}
        />
      )}
    </div>
  );
};

// CourseViewer.jsx

export default MyCourses;
