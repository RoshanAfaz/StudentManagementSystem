import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, User, Lock, Menu } from 'lucide-react';
import { Button } from '../UI/Button';
import ChangePasswordModal from '../UI/ChangePasswordModal';
import useEventBadge from '../../hooks/useEventBadge';

const Navbar = ({ onToggleSidebar }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { hasUnread } = useEventBadge();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    const handleNotificationClick = () => {
        if (user?.role) {
            navigate(`/${user.role.toLowerCase()}/events`);
        }
    };

    return (
        <>
            <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 px-6 h-16 flex items-center justify-between transition-colors duration-500">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={onToggleSidebar}>
                        <Menu className="w-6 h-6" />
                    </Button>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            Welcome back, <span className="text-primary">{user?.name}</span>
                        </h2>
                        <p className="text-xs text-muted-foreground capitalize">{user?.role} Dashboard</p>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-primary gap-2"
                        onClick={() => setIsPasswordModalOpen(true)}
                    >
                        <Lock className="w-4 h-4" />
                        <span className="hidden sm:inline">Change Password</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative text-gray-500 hover:text-primary"
                        onClick={handleNotificationClick}
                    >
                        <Bell className="w-5 h-5" />
                        {hasUnread && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                        )}
                    </Button>

                    <div className="flex items-center space-x-3 pl-4 border-l">
                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shadow-sm border border-primary/20">
                            {user?.name?.charAt(0)}
                        </div>
                    </div>
                </div>
            </div>

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </>
    );
};

export default Navbar;
