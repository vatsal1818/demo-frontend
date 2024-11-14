// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import LoginSignUp from "./components/Login-Signup";
import Navbar from "./components/navbar/navbar";
import Home from "./pages/Home/home.js";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.js";
import UserChat from './pages/Chat/Chat.js';
import Layout from './components/Layout/Layout.js';
import AllTrades from './pages/All-trade/AllTrade.js';
import AdminMessagePopup from './components/AdminMessagePopUp/AdminMessagePopup';
import { SocketProvider } from './components/SocketContext/SocketContext.js';
import CourseList from './pages/Courses/CourseList.js';
import CourseDetail from './pages/Courses/CourseDetails.js';
import PurchasedCourses from './pages/Courses/PurchasedCourse.js';
import CourseContent from './pages/Courses/CourseContent.js';
import LandingPage from './pages/LandingPage/LandingPage.js';

function App() {
  return (
    <Router>
      <SocketProvider>
        <div>
          <Navbar />
          <Layout>
            <AdminMessagePopup />
            <Routes>
              <Route path="/login" element={<LoginSignUp />} />
              <Route path="/home-page" element={<LandingPage />} />
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><UserChat /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
              <Route path="/alltrade" element={<ProtectedRoute><AllTrades /></ProtectedRoute>} />
              <Route path="/courses" element={<ProtectedRoute><CourseList /></ProtectedRoute>} />
              <Route path="/courses/:courseId" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
              <Route path="/my-courses" element={<ProtectedRoute><PurchasedCourses /></ProtectedRoute>} />
              <Route path="/courses/:courseId/content" element={<ProtectedRoute><CourseContent /></ProtectedRoute>} />
            </Routes>
          </Layout>
        </div>
      </SocketProvider>
    </Router>
  );
}

export default App;