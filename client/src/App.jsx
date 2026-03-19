import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import PageLoader from './components/UI/PageLoader';

// Lazy Loaded Components
const Login = lazy(() => import('./pages/Login'));
const Home = lazy(() => import('./pages/Home'));
const PrincipalDashboard = lazy(() => import('./pages/PrincipalDashboard'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const ParentDashboard = lazy(() => import('./pages/ParentDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AttendanceReportDashboard = lazy(() => import('./pages/AttendanceReportDashboard'));
const MarksReportDashboard = lazy(() => import('./pages/MarksReportDashboard'));

function App() {
    return (
        <AuthProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path="/" element={Capacitor.isNativePlatform() ? <Navigate to="/login" replace /> : <Home />} />
                        <Route path="/login" element={<Login />} />

                        {/* Protected Routes */}
                        <Route element={<ProtectedRoute allowedRoles={['Admin', 'Principal', 'Teacher', 'Student', 'Parent']}><MainLayout /></ProtectedRoute>}>
                            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />

                            <Route path="/principal/dashboard" element={<ProtectedRoute allowedRoles={['Principal']}><PrincipalDashboard /></ProtectedRoute>} />
                            <Route path="/principal/students" element={<ProtectedRoute allowedRoles={['Principal']}><PrincipalDashboard /></ProtectedRoute>} />
                            <Route path="/principal/teachers" element={<ProtectedRoute allowedRoles={['Principal']}><PrincipalDashboard /></ProtectedRoute>} />

                            <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={['Teacher']}><TeacherDashboard /></ProtectedRoute>} />
                            <Route path="/teacher/attendance" element={<ProtectedRoute allowedRoles={['Teacher']}><TeacherDashboard /></ProtectedRoute>} />
                            <Route path="/teacher/marks" element={<ProtectedRoute allowedRoles={['Teacher']}><TeacherDashboard /></ProtectedRoute>} />
                            <Route path="/teacher/timetable" element={<ProtectedRoute allowedRoles={['Teacher']}><TeacherDashboard /></ProtectedRoute>} />
                            <Route path="/teacher/events" element={<ProtectedRoute allowedRoles={['Teacher']}><TeacherDashboard /></ProtectedRoute>} />
                            <Route path="/teacher/reports" element={<ProtectedRoute allowedRoles={['Teacher', 'Principal']}><AttendanceReportDashboard /></ProtectedRoute>} />
                            <Route path="/teacher/marks-report" element={<ProtectedRoute allowedRoles={['Teacher', 'Principal']}><MarksReportDashboard /></ProtectedRoute>} />

                            <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['Student']}><StudentDashboard /></ProtectedRoute>} />
                            <Route path="/student/marks" element={<ProtectedRoute allowedRoles={['Student']}><StudentDashboard /></ProtectedRoute>} />
                            <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['Student']}><StudentDashboard /></ProtectedRoute>} />
                            <Route path="/student/timetable" element={<ProtectedRoute allowedRoles={['Student']}><StudentDashboard /></ProtectedRoute>} />
                            <Route path="/student/events" element={<ProtectedRoute allowedRoles={['Student']}><StudentDashboard /></ProtectedRoute>} />

                            <Route path="/parent/dashboard" element={<ProtectedRoute allowedRoles={['Parent']}><ParentDashboard /></ProtectedRoute>} />
                            <Route path="/parent/timetable" element={<ProtectedRoute allowedRoles={['Parent']}><ParentDashboard /></ProtectedRoute>} />
                            <Route path="/parent/events" element={<ProtectedRoute allowedRoles={['Parent']}><ParentDashboard /></ProtectedRoute>} />

                            <Route path="/principal/events" element={<ProtectedRoute allowedRoles={['Principal']}><PrincipalDashboard /></ProtectedRoute>} />
                            <Route path="/principal/reports" element={<ProtectedRoute allowedRoles={['Principal']}><AttendanceReportDashboard /></ProtectedRoute>} />
                            <Route path="/principal/marks-report" element={<ProtectedRoute allowedRoles={['Principal', 'Teacher']}><MarksReportDashboard /></ProtectedRoute>} />
                        </Route>
                    </Routes>
                </Suspense>
            </Router>
        </AuthProvider>
    );
}

export default App;
