import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    ChevronRight,
    BookOpen,
    Users,
    Trophy,
    ShieldCheck,
    Zap,
    BarChart3,
    ArrowRight,
    Menu,
    X as CloseIcon
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import heroImage from '../assets/hero.png';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 w-full z-50 transition-all duration-300 px-6 md:px-12 pt-[var(--sat,1rem)] pb-4 lg:py-4 ${isScrolled || isMobileMenuOpen ? 'bg-white/90 backdrop-blur-lg shadow-sm' : 'bg-transparent'
                }`}
            style={{ '--sat': 'env(safe-area-inset-top, 24px)' }}
        >

            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <BookOpen className="text-white w-6 h-6" />
                    </div>
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-800">
                        Achievers <span className="text-indigo-600">Academy</span>
                    </span>
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                    <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
                    <a href="#stats" className="hover:text-indigo-600 transition-colors">Impact</a>
                    <Link to="/login">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
                        >
                            Portal Login
                        </motion.button>
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button 
                    className="md:hidden p-2 text-slate-600"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <CloseIcon /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden overflow-hidden bg-white border-t border-slate-100 mt-4 rounded-2xl shadow-xl"
                    >
                        <div className="flex flex-col p-6 gap-4 font-semibold text-slate-600">
                            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-indigo-600 transition-colors">Features</a>
                            <a href="#stats" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-indigo-600 transition-colors">Impact</a>
                            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                <button className="w-full bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-indigo-600 transition-all">
                                    Portal Login
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

const FeatureCard = ({ icon: Icon, title, desc, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay }}
        className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-indigo-100 transition-all group"
    >
        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
            <Icon className="text-indigo-600 w-7 h-7 group-hover:text-white transition-colors" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
        <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
    </motion.div>
);

const Home = () => {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-50/50 to-transparent -z-10" />
                <motion.div
                    style={{ y }}
                    className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-3xl -z-10"
                />

                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-widest mb-6"
                        >
                            Next-Gen Education Platform
                        </motion.span>
                        <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-8xl font-black text-slate-900 leading-[1.1] tracking-tighter mb-8">
                            Achievers <span className="text-indigo-600 italic">Academy.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 max-w-lg leading-relaxed mb-10 font-medium">
                            Mastering education through data intelligence. A precision-engineered platform for evidence-based academic excellence.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/login" className="w-full sm:w-auto">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-indigo-600 text-white px-8 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-indigo-200 flex items-center justify-center gap-2 group"
                                >
                                    Enter Portal
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            </Link>
                        </div>

                        <div className="mt-12 flex items-center gap-4 text-slate-400">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200" />
                                ))}
                            </div>
                            <span className="text-sm font-semibold">Trusted by 500+ Students & Staff</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="relative"
                    >
                        <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(79,70,229,0.3)]">
                            <img
                                src={heroImage}
                                alt="Dashboard Preview"
                                className="w-full h-auto"
                            />
                        </div>
                        {/* Decorative floating element */}
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-6 bg-white relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                            Built for the Future of <span className="text-indigo-600">Learning</span>
                        </h2>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed">
                            Everything you need to manage a modern educational institution in one unified, high-performance platform.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={BarChart3}
                            title="Advanced Analytics"
                            desc="Real-time performance tracking with beautiful insights. Identify trends and provide personalized support."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={Zap}
                            title="Instant Attendance"
                            desc="Mark and track attendance across classes with one click. Automated reminders for parents and staff."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={ShieldCheck}
                            title="Enterprise Security"
                            desc="Role-based access control ensuring data privacy. Secure portal for Principals, Teachers, and Parents."
                            delay={0.3}
                        />
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section id="stats" className="py-24 px-6 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}></div>

                <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                    <div>
                        <p className="text-5xl font-black mb-2">99%</p>
                        <p className="text-indigo-300 font-bold uppercase tracking-widest text-xs">Accuracy</p>
                    </div>
                    <div>
                        <p className="text-5xl font-black mb-2">10k+</p>
                        <p className="text-indigo-300 font-bold uppercase tracking-widest text-xs">Students</p>
                    </div>
                    <div>
                        <p className="text-5xl font-black mb-2">500+</p>
                        <p className="text-indigo-300 font-bold uppercase tracking-widest text-xs">Teachers</p>
                    </div>
                    <div>
                        <p className="text-5xl font-black mb-2">24/7</p>
                        <p className="text-indigo-300 font-bold uppercase tracking-widest text-xs">Live Support</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-slate-100 bg-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <BookOpen className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-slate-800">
                            Achievers <span className="text-indigo-600">Academy</span>
                        </span>
                    </div>

                    <p className="text-slate-400 text-sm font-semibold">
                        © 2026 Achievers Academy. Inner Ring Road, Hosur.
                    </p>

                    <div className="flex gap-6">
                        <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><Users className="w-5 h-5" /></a>
                        <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><Trophy className="w-5 h-5" /></a>
                        <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><ShieldCheck className="w-5 h-5" /></a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
