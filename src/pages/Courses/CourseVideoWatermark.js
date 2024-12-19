import React from 'react';

const CourseVideoWatermark = ({ userData }) => {
    if (!userData) return null;

    return (
        <div className="watermark">
            <div className="watermark-content">
                {userData.username && <p>{userData.username}</p>}
                {userData.email && <p>{userData.email}</p>}
            </div>
        </div>
    );
};

export default CourseVideoWatermark;