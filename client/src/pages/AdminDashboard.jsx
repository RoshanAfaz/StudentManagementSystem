import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Shield, School, Activity, Plus, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Portal from '../components/UI/Portal';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Card, CardHeader, CardTitle, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Label } from '../components/UI/Label';
import { X } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const AdminDashboard = () => {
    const [stats, setStats] = useState({ students: 0, teachers: 0, parents: 0, principals: 0, admins: 0, users: 0 });
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({});

    // Add User Modal State
    const [showAddUser, setShowAddUser] = useState(false);
    const [userRole, setUserRole] = useState('Principal'); // Default to Principal
    const [msg, setMsg] = useState('');

    // Reset System State
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetInput, setResetInput] = useState('');

    const token = user?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchStats = async () => {
        try {
            const { data } = await axios.get('/api/dashboard/admin/stats', config);
            setStats(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching admin stats", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchStats();
    }, [token]);

    const handleValidChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/auth/register', {
                ...formData,
                role: userRole,
                password: formData.password || 'password123'
            }, config);

            setMsg(`${userRole} added successfully!`);
            fetchStats(); // Refresh stats

            setTimeout(() => {
                setMsg('');
                setShowAddUser(false);
                setFormData({});
            }, 2000);
        } catch (error) {
            setMsg(error.response?.data?.message || `Error adding ${userRole}`);
        }
    };

    const handleResetSystem = async (e) => {
        e.preventDefault();
        try {
            await axios.delete('/api/dashboard/admin/reset', config);
            setMsg('System has been completely reset.');
            fetchStats();
            setTimeout(() => {
                setMsg('');
                setShowResetModal(false);
                setResetInput('');
            }, 2000);
        } catch (error) {
            setMsg(error.response?.data?.message || 'Error resetting system');
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Admin Dashboard...</div>;

    const chartData = {
        labels: ['Students', 'Teachers', 'Parents', 'Principals', 'Admins'],
        datasets: [{
            data: [stats.students, stats.teachers, stats.parents, stats.principals, stats.admins],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-8"
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm">Master Control</h1>
                        <p className="text-muted-foreground text-lg mt-1">System-wide overview & administration</p>
                    </div>
                    <div className="flex gap-3">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button onClick={() => setShowResetModal(true)} variant="destructive" className="shadow-lg mr-2">
                                <AlertTriangle className="w-4 h-4 mr-2" /> Reset System
                            </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button onClick={() => { setUserRole('Principal'); setShowAddUser(true); }} variant="premium" className="shadow-md">
                                <Plus className="w-4 h-4 mr-2" /> Add Principal
                            </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button onClick={() => { setUserRole('Admin'); setShowAddUser(true); }} variant="premium" className="shadow-md !from-slate-700 !to-slate-900">
                                <Plus className="w-4 h-4 mr-2" /> Add Admin
                            </Button>
                        </motion.div>
                    </div>
                </div>

                {msg && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-lg shadow-sm font-medium ${msg.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                        {msg}
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Users" value={stats.users} icon={<Activity />} color="blue" />
                    <StatCard title="Students" value={stats.students} icon={<Users />} color="emerald" />
                    <StatCard title="Teachers" value={stats.teachers} icon={<School />} color="amber" />
                    <StatCard title="Staff / Admins" value={stats.principals + stats.admins} icon={<Shield />} color="purple" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <Card glass className="border-0 overflow-hidden relative group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
                            <CardHeader>
                                <CardTitle className="text-xl font-bold text-slate-800">Platform Distribution</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[350px] flex justify-center items-center pb-6">
                                <Pie
                                    data={chartData}
                                    options={{
                                        maintainAspectRatio: false,
                                        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } },
                                        cutout: '70%'
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <Card glass className="border-0 overflow-hidden relative group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                            <CardHeader>
                                <CardTitle className="text-xl font-bold text-slate-800">User Demographics</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[350px] pb-6">
                                <Bar
                                    data={{
                                        ...chartData,
                                        datasets: [{
                                            ...chartData.datasets[0],
                                            borderRadius: 8,
                                            barThickness: 40,
                                        }]
                                    }}
                                    options={{
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        scales: {
                                            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.03)' }, border: { display: false } },
                                            x: { grid: { display: false }, border: { display: false } }
                                        }
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>

            {/* Modals - Wrapped in Portal to avoid clipping */}
            <Portal>
                <AnimatePresence>
                    {showAddUser && (
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto relative"
                            >
                                <button type="button" onClick={() => setShowAddUser(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>

                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`p-3 rounded-xl ${userRole === 'Principal' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-800'}`}>
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">Add New {userRole}</h2>
                                        <p className="text-sm text-slate-500">Create a high-level system account</p>
                                    </div>
                                </div>

                                <form onSubmit={handleAddUser} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label className="text-slate-700 font-semibold">Full Name</Label>
                                        <Input name="name" onChange={handleValidChange} required className="bg-slate-50 border-slate-200 focus:bg-white transition-colors" placeholder="e.g. John Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-700 font-semibold">Email Address</Label>
                                        <Input name="email" type="email" onChange={handleValidChange} required className="bg-slate-50 border-slate-200 focus:bg-white transition-colors" placeholder="admin@achievers.edu" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-700 font-semibold">Temporary Password</Label>
                                        <Input name="password" type="password" placeholder="Defaults to password123" onChange={handleValidChange} className="bg-slate-50 border-slate-200 focus:bg-white transition-colors" />
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <Button type="button" variant="outline" onClick={() => setShowAddUser(false)} className="flex-1 border-slate-200 text-slate-600">Cancel</Button>
                                        <Button type="submit" className={`flex-1 text-white shadow-lg shadow-${userRole === 'Principal' ? 'purple' : 'slate'}-500/30 ${userRole === 'Principal' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-800 hover:bg-slate-900'}`}>
                                            Create Account
                                        </Button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Reset System Modal */}
                <AnimatePresence>
                    {showResetModal && (
                        <div className="fixed inset-0 bg-red-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="bg-white p-8 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.3)] w-full max-w-md relative border-t-4 border-red-500"
                            >
                                <button type="button" onClick={() => { setShowResetModal(false); setResetInput(''); }} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>

                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 rounded-xl bg-red-100 text-red-600">
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">System Reset</h2>
                                        <p className="text-sm text-red-500 font-medium">Critical Destructive Action</p>
                                    </div>
                                </div>

                                <p className="text-slate-600 mb-6">
                                    This will permanently delete <strong>all</strong> students, teachers, parents, classes, marks, attendance, and events in the database. Only Admin accounts will be preserved.
                                </p>

                                <form onSubmit={handleResetSystem} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label className="text-slate-700 font-semibold">Type 'RESET' to confirm</Label>
                                        <Input
                                            value={resetInput}
                                            onChange={(e) => setResetInput(e.target.value)}
                                            required
                                            className="bg-red-50/50 border-red-200 focus:border-red-500 focus:ring-red-500 transition-colors uppercase"
                                            placeholder="RESET"
                                        />
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <Button type="button" variant="outline" onClick={() => { setShowResetModal(false); setResetInput(''); }} className="flex-1 border-slate-200 text-slate-600">Cancel</Button>
                                        <Button
                                            type="submit"
                                            disabled={resetInput !== 'RESET'}
                                            className="flex-1 text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/30"
                                        >
                                            Delete Everything
                                        </Button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </Portal>
        </>
    );
};

const StatCard = ({ title, value, icon, color }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value || 0;

        if (start >= end) {
            setCount(end);
            return;
        }

        const totalDuration = 1000;
        let incrementTime = Math.max(1, Math.floor(totalDuration / end));
        // Add a safety limit so it doesn't increment too many times individually
        const step = Math.max(1, Math.floor(end / (totalDuration / 16))); // Assuming 60fps ~ 16ms

        const timer = setInterval(() => {
            start += step;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value]);

    const colorConfig = {
        blue: 'from-blue-500 to-blue-600 text-blue-600 bg-blue-50 border-blue-100',
        emerald: 'from-emerald-500 to-emerald-600 text-emerald-600 bg-emerald-50 border-emerald-100',
        amber: 'from-amber-500 to-amber-600 text-amber-600 bg-amber-50 border-amber-100',
        purple: 'from-purple-500 to-purple-600 text-purple-600 bg-purple-50 border-purple-100',
    };

    const config = colorConfig[color];

    return (
        <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
            <Card className={`overflow-hidden border relative shadow-md hover:shadow-xl transition-all duration-300 ${config.split(' ')[2]} ${config.split(' ')[3]}`}>
                <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${config.split(' ')[0]} ${config.split(' ')[1]}`} />
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
                            <h3 className="text-4xl font-black text-slate-800 tracking-tight">{count}</h3>
                        </div>
                        <div className={`p-4 rounded-2xl bg-white shadow-sm ${config.split(' ')[2]}`}>
                            {icon}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default AdminDashboard;
