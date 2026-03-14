import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Label } from '../components/UI/Label';
import { GraduationCap, School, BookOpen, Users, UserCircle } from 'lucide-react';

const Login = () => {
    // const [isRegistering, setIsRegistering] = useState(false); // Removed
    const [role, setRole] = useState('Principal');
    // const [name, setName] = useState(''); // Removed
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [studentId, setStudentId] = useState('');
    const [phone, setPhone] = useState(''); // Kept for flexible login (Phone/Email)
    const [error, setError] = useState('');
    // const [msg, setMsg] = useState(''); // Removed
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Registration logic removed
            const credentials = { password };
            if (role === 'Student') {
                credentials.studentId = studentId;
            } else {
                credentials.email = email;
            }

            const user = await login(credentials);

            if (user.role === 'Admin') navigate('/admin/dashboard');
            else if (user.role === 'Principal') navigate('/principal/dashboard');
            else if (user.role === 'Teacher') navigate('/teacher/dashboard');
            else if (user.role === 'Student') navigate('/student/dashboard');
            else if (user.role === 'Parent') navigate('/parent/dashboard');

        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { id: 'Principal', icon: School, color: 'text-purple-600', bg: 'bg-purple-50', gradient: 'from-purple-100 to-indigo-100', buttonGradient: 'from-purple-600 to-indigo-600' },
        { id: 'Teacher', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-100 to-teal-100', buttonGradient: 'from-emerald-600 to-teal-600' },
        { id: 'Student', icon: GraduationCap, color: 'text-amber-600', bg: 'bg-amber-50', gradient: 'from-amber-100 to-orange-100', buttonGradient: 'from-amber-600 to-orange-600' },
        { id: 'Parent', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-100 to-cyan-100', buttonGradient: 'from-blue-600 to-cyan-600' },
    ];

    const currentRole = roles.find(r => r.id === role);

    return (
        <motion.div
            className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-1000 ${currentRole.bg}`}
            initial={false}
            animate={{ backgroundColor: currentRole.bgColor }}
        >
            {/* Animated Background Blobs - Disabled on mobile for performance */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none hidden md:block">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        x: [0, 100, 0],
                        y: [0, -50, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className={`absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full blur-[100px] opacity-40 bg-gradient-to-br ${currentRole.gradient}`}
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, -60, 0],
                        x: [0, -50, 0],
                        y: [0, 100, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 1 }}
                    className={`absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] rounded-full blur-[80px] opacity-40 bg-gradient-to-tr ${currentRole.gradient}`}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
                className="z-10 w-full max-w-md px-4"
            >

                <Card className="shadow-2xl border-white/20 md:backdrop-blur-xl bg-white md:bg-white/80 overflow-hidden relative group">
                    {/* Subtle Shine Effect - Only on hover/Desktop */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 hidden md:block" />

                    <CardHeader className="text-center space-y-2 pb-2">
                        <motion.div
                            className="mx-auto bg-white p-4 rounded-full w-20 h-20 shadow-lg flex items-center justify-center mb-2"
                            layoutId="role-icon-wrapper"
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={role}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {(() => {
                                        const Icon = currentRole.icon;
                                        return <Icon className={`w-10 h-10 ${currentRole.color}`} />;
                                    })()}
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-slate-800">
                            Welcome to <span className="text-primary">Achievers Academy</span>
                        </CardTitle>
                        <CardDescription className="text-base">
                            Access your portal as <span className={`font-bold ${currentRole.color}`}>{role}</span>
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-4">
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center font-medium border border-red-100">
                                {error}
                            </motion.div>
                        )}

                        <div className="grid grid-cols-4 gap-2 p-1 bg-slate-100/80 rounded-xl relative">
                            {/* Sliding Background for Tabs */}
                            <motion.div
                                className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm"
                                initial={false}
                                animate={{
                                    left: `${roles.findIndex(r => r.id === role) * 25}%`,
                                    width: '25%',
                                    x: roles.findIndex(r => r.id === role) === 0 ? '4px' : roles.findIndex(r => r.id === role) === 3 ? '-4px' : '0%' // Adjust for padding
                                }}
                                style={{ width: 'calc(25% - 4px)', margin: '0 2px' }} // Manual adjustment
                                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                            />

                            {roles.map((r) => (
                                <button
                                    key={r.id}
                                    onClick={() => setRole(r.id)}
                                    className={`relative z-10 py-2 text-[10px] sm:text-xs font-semibold rounded-lg transition-colors duration-200 capitalize ${role === r.id ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {r.id}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <motion.div
                                key={role === 'Student' ? 'student-fields' : 'regular-fields'}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                {role === 'Student' ? (
                                    <div className="space-y-2 group">
                                        <Label htmlFor="studentId" className="block text-sm font-medium text-slate-700">Student ID</Label>
                                        <div className="relative">
                                            <Input
                                                id="studentId"
                                                placeholder="e.g. STU123456"
                                                value={studentId}
                                                onChange={(e) => setStudentId(e.target.value)}
                                                required
                                                className="pl-10 transition-all border-slate-200 focus:border-amber-500 focus:ring-amber-500"
                                            />
                                            <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2 group">
                                        <Label htmlFor="email" className="block text-sm font-medium text-slate-700">Email or Phone</Label>
                                        <div className="relative">
                                            <Input
                                                id="email"
                                                type="text"
                                                placeholder="name@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className={`pl-10 transition-all border-slate-200 focus:border-${currentRole.color.split('-')[1]}-500 focus:ring-${currentRole.color.split('-')[1]}-500`}
                                            />
                                            <UserCircle className={`absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-${currentRole.color.split('-')[1]}-500 transition-colors`} />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2 group">
                                    <Label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="pl-10 transition-all border-slate-200 focus:border-slate-500 focus:ring-slate-500"
                                        />
                                        <Users className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    className={`w-full py-6 text-lg font-semibold shadow-xl transition-all duration-300 bg-gradient-to-r ${currentRole.buttonGradient} text-white hover:opacity-90 hover:shadow-2xl`}
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                            className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                                        />
                                    ) : (
                                        <>Access Dashboard <span className="ml-2">→</span></>
                                    )}
                                </Button>
                            </motion.div>
                        </form>
                    </CardContent>
                </Card>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    delay={0.5}
                    className="text-center mt-8 text-xs text-slate-400 font-medium"
                >
                    &copy; 2026 Achievers Academy, Inner Ring Road, Hosur. Secure Login.
                </motion.p>
            </motion.div>
        </motion.div>
    );
};

export default Login;
