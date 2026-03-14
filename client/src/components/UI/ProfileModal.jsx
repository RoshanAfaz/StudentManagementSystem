import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, User, Mail, Phone, Shield, Save, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Button } from './Button';
import { Input } from './Input';
import { Label } from './Label';
import Portal from './Portal';

const ProfileModal = ({ isOpen, onClose }) => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    const fileInputRef = useRef(null);

    const isStudent = user?.role === 'Student';

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        setError('');
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`
                }
            };
            const { data } = await axios.post('/api/users/profile/photo', formData, config);
            updateUser({ avatarUrl: data.avatarUrl });
            setSuccess('Photo updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload photo');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };
            const { data } = await axios.put('/api/users/profile', formData, config);
            updateUser(data);
            setSuccess('Profile updated successfully!');
            setTimeout(() => {
                setSuccess('');
                // Maybe close modal? Or let user see success
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Portal>
            <AnimatePresence>
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[95vh] border border-slate-100 no-scrollbar"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Image/Background */}
                        <div className="h-24 sm:h-32 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
                            <button 
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Profile Content */}
                        <div className="px-4 sm:px-8 pb-8">
                            <div className="relative -mt-12 sm:-mt-16 mb-6 sm:mb-8 flex flex-col items-center">
                                <div className="relative group">
                                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[1.5rem] sm:rounded-[2rem] bg-white p-1 sm:p-1.5 shadow-xl">
                                        <div className="w-full h-full rounded-[1.3rem] sm:rounded-[1.7rem] bg-slate-100 overflow-hidden flex items-center justify-center border-2 border-slate-50">
                                            {user?.avatarUrl ? (
                                                <img 
                                                    src={user.avatarUrl} 
                                                    alt={user.name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300" />
                                            )}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => fileInputRef.current.click()}
                                        className="absolute bottom-0 right-0 p-2 sm:p-3 bg-indigo-600 text-white rounded-xl sm:rounded-2xl shadow-lg hover:bg-indigo-700 transition-all hover:scale-110 active:scale-95 group-hover:rotate-6 font-bold"
                                        disabled={uploading}
                                    >
                                        {uploading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Camera className="w-4 h-4 sm:w-5 sm:h-5" />}
                                    </button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handlePhotoUpload} 
                                        className="hidden" 
                                        accept="image/*"
                                    />
                                </div>
                                <div className="mt-4 text-center">
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">{user?.name}</h2>
                                    <p className="text-[10px] sm:text-xs font-semibold text-indigo-600 uppercase tracking-widest mt-1.5">{user?.role} Portal</p>
                                </div>
                            </div>

                            {error && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium">
                                    {error}
                                </motion.div>
                            )}

                            {success && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-sm font-medium">
                                    {success}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2 group">
                                    <Label className="text-slate-600 font-bold ml-1">Full Name</Label>
                                    <div className="relative">
                                        <Input 
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="pl-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-2xl h-12"
                                        />
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                    </div>
                                </div>

                                <div className="space-y-2 group">
                                    <Label className="text-slate-600 font-bold ml-1">Email Address</Label>
                                    <div className="relative">
                                        <Input 
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            disabled={isStudent}
                                            required
                                            className={`pl-12 transition-all rounded-2xl h-12 ${isStudent ? 'bg-slate-100 text-slate-500 italic border-slate-100 cursor-not-allowed' : 'bg-slate-50/50 border-slate-200 focus:bg-white'}`}
                                        />
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                        {isStudent && <Shield className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />}
                                    </div>
                                </div>

                                <div className="space-y-2 group">
                                    <Label className="text-slate-600 font-bold ml-1">Phone Number</Label>
                                    <div className="relative">
                                        <Input 
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            disabled={isStudent}
                                            className={`pl-12 transition-all rounded-2xl h-12 ${isStudent ? 'bg-slate-100 text-slate-500 italic border-slate-100 cursor-not-allowed' : 'bg-slate-50/50 border-slate-200 focus:bg-white'}`}
                                        />
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                        {isStudent && <Shield className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />}
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button 
                                        type="submit" 
                                        className="w-full py-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                Save Profile Changes
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </AnimatePresence>
        </Portal>
    );
};

export default ProfileModal;
