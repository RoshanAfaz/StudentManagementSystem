import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Portal from './Portal';
import { Button } from './Button';
import { Input } from './Input';
import { Label } from './Label';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

import { ArrowLeft, X, Lock } from 'lucide-react';

const ChangePasswordModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [msg, setMsg] = useState({ type: '', text: '' });
    const { user } = useAuth();
    const token = user?.token;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg({ type: '', text: '' });

        if (formData.newPassword !== formData.confirmPassword) {
            setMsg({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        try {
            await axios.put('/api/auth/change-password',
                { currentPassword: formData.currentPassword, newPassword: formData.newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMsg({ type: 'success', text: 'Password changed successfully!' });
            setTimeout(() => {
                onClose();
                setMsg({ type: '', text: '' });
                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }, 2000);
        } catch (error) {
            setMsg({ type: 'error', text: error.response?.data?.message || 'Failed to change password' });
        }
    };

    return (
        <Portal>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden"
                        >
                            {/* Status Bar */}
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

                            <button
                                type="button"
                                onClick={onClose}
                                className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 transition-colors p-1"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">Security Settings</h2>
                                    <p className="text-sm text-slate-500">Update your account password</p>
                                </div>
                            </div>

                            {msg.text && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className={`p-4 mb-6 text-sm rounded-xl font-medium border ${msg.type === 'error'
                                        ? 'bg-red-50 text-red-700 border-red-100'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                        }`}
                                >
                                    {msg.text}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-slate-700 font-semibold">Current Password</Label>
                                    <Input
                                        type="password"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        required
                                        className="bg-slate-50 border-slate-200 focus:bg-white transition-all py-2.5"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700 font-semibold">New Password</Label>
                                    <Input
                                        type="password"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        required
                                        className="bg-slate-50 border-slate-200 focus:bg-white transition-all py-2.5"
                                        placeholder="Enter new password"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700 font-semibold">Confirm New Password</Label>
                                    <Input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        className="bg-slate-50 border-slate-200 focus:bg-white transition-all py-2.5"
                                        placeholder="Confirm new password"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onClose}
                                        className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50 gap-2 font-semibold"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="premium"
                                        className="flex-1 shadow-lg shadow-indigo-500/20 font-semibold"
                                    >
                                        Update Password
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Portal>
    );
};

export default ChangePasswordModal;
