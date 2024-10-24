import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./CourseList.css"
import { COURSES } from '../../helper/Apihelpers';

const CourseList = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await fetch(COURSES);
            if (!response.ok) throw new Error('Failed to fetch courses');
            const data = await response.json();
            setCourses(data.data);
        } catch (err) {
            setError('Error loading courses');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
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

    return (
        <div className="courses-container">
            <h1 className="courses-title">Available Courses</h1>
            <div className="courses-grid">
                {courses.map((course) => (
                    <div key={course._id} className="course-card">
                        <div className="course-header">
                            <h2 className="course-name">{course.courseName}</h2>
                        </div>
                        <div className="course-footer">
                            <div className="course-price">${course.price.toFixed(2)}</div>
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
        </div>
    );
};

export default CourseList;