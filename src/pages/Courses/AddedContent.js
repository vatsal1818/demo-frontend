import React from 'react'
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AddedContent = () => {
    const navigate = useNavigate();

    return (
        <div>
            <button
                onClick={() => navigate('/my-courses')}
                className="back-button"
            >
                <ArrowLeft size={18} />
                Back to My Courses
            </button>
            <h1>Added Content</h1>
        </div>
    )
}

export default AddedContent
