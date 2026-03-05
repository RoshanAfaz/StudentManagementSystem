import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MainLayout = () => {
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    useEffect(() => {
        if (user && user.role) {
            document.documentElement.setAttribute('data-theme', user.role);
        }
        return () => {
            document.documentElement.removeAttribute('data-theme');
        };
    }, [user]);

    return (
        <div className="flex bg-background h-screen overflow-hidden font-sans text-foreground transition-colors duration-500">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden bg-slate-50/50">
                <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 p-6 overflow-y-auto scroll-smooth">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
