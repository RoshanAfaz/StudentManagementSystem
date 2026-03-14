import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Users, BookOpen, Calendar, FileText, LogOut, GraduationCap, ClipboardList, Clock, BarChart3 } from 'lucide-react';
import { cn } from '../../lib/utils';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    // Close sidebar on mobile when route changes
    React.useEffect(() => {
        // Optionally close logic if needed, usually managed by user click but nice to have.
        // If we use MainLayout overlay click, that handles "close on click outside".
        // But "close on link click" is good for mobile.
        if (window.innerWidth < 768) {
            onClose && onClose();
        }
    }, [location.pathname]);

    const isActive = (path) => location.pathname === path;

    return (
        <div className={cn(
            "fixed inset-y-0 left-0 z-[60] w-64 bg-slate-900 text-slate-100 flex flex-col shadow-2xl border-r border-slate-800 transition-all duration-300 ease-in-out md:static md:translate-x-0 md:z-auto",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                    <GraduationCap className="text-white w-5 h-5" />
                </div>
                <span className="text-lg font-bold tracking-tight">Achievers Academy</span>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {user?.role === 'Principal' && (
                    <>
                        <NavItem to="/principal/dashboard" icon={<Home />} label="Dashboard" active={isActive('/principal/dashboard')} />
                        <NavItem to="/principal/students" icon={<Users />} label="Students" active={isActive('/principal/students')} />
                        <NavItem to="/principal/teachers" icon={<Users />} label="Teachers" active={isActive('/principal/teachers')} />
                        <NavItem to="/principal/reports" icon={<Clock />} label="Attendance Reports" active={isActive('/principal/reports')} />
                        <NavItem to="/principal/marks-report" icon={<FileText />} label="Marks Reports" active={isActive('/principal/marks-report')} />
                    </>
                )}

                {user?.role === 'Teacher' && (
                    <>
                        <NavItem to="/teacher/dashboard" icon={<Home />} label="Dashboard" active={isActive('/teacher/dashboard')} />
                        <NavItem to="/teacher/attendance" icon={<ClipboardList />} label="Attendance" active={isActive('/teacher/attendance')} />
                        <NavItem to="/teacher/marks" icon={<FileText />} label="Marks Management" active={isActive('/teacher/marks')} />
                        <NavItem to="/teacher/timetable" icon={<Clock />} label="Timetable" active={isActive('/teacher/timetable')} />
                        <NavItem to="/teacher/reports" icon={<Clock />} label="Attendance Reports" active={isActive('/teacher/reports')} />
                        <NavItem to="/teacher/marks-report" icon={<FileText />} label="Marks Reports" active={isActive('/teacher/marks-report')} />
                    </>
                )}

                {user?.role === 'Student' && (
                    <>
                        <NavItem to="/student/dashboard" icon={<Home />} label="Dashboard" active={isActive('/student/dashboard')} />
                        <NavItem to="/student/marks" icon={<FileText />} label="My Marks" active={isActive('/student/marks')} />
                        <NavItem to="/student/attendance" icon={<ClipboardList />} label="My Attendance" active={isActive('/student/attendance')} />
                        <NavItem to="/student/timetable" icon={<Clock />} label="Timetable" active={isActive('/student/timetable')} />
                    </>
                )}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={logout}
                    className="flex w-full items-center space-x-3 p-3 rounded-md text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

const NavItem = ({ to, icon, label, active }) => (
    <Link
        to={to}
        className={cn(
            "flex items-center space-x-3 p-3 rounded-md transition-all duration-200 group",
            active
                ? "bg-primary/20 text-primary-400 border-l-4 border-primary"
                : "hover:bg-slate-800 text-slate-400 hover:text-slate-100"
        )}
    >
        <span className={cn("transition-colors", active ? "text-primary" : "group-hover:text-white")}>
            {icon}
        </span>
        <span className="font-medium">{label}</span>
    </Link>
);

export default Sidebar;
