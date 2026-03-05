import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
    return (
        <div className="min-h-screen w-full bg-slate-50 overflow-hidden relative flex flex-col items-center justify-center">
            {/* Background Gradient & Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 z-0 opacity-80" />
            <div className="absolute inset-0 z-0 opacity-30" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)',
                backgroundSize: '40px 40px'
            }}></div>

            {/* Abstract Floating Shapes */}
            <motion.div
                className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40"
                animate={{
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40"
                animate={{
                    x: [0, -30, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute top-[20%] right-[20%] w-64 h-64 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
                animate={{
                    x: [0, -20, 0],
                    y: [0, 40, 0],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="z-10 text-center px-4 max-w-4xl"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    <h1 className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 mb-6 tracking-tight drop-shadow-sm">
                        Achievers Academy
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-xl md:text-2xl text-slate-600 font-light mb-12 max-w-2xl mx-auto"
                >
                    A powerful, efficient, and transparent platform for <br className="hidden md:block" /> educational excellence at Inner Ring Road, Hosur.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <Link to="/login">
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(37, 99, 235, 0.2)" }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-full font-bold shadow-lg text-lg border border-blue-400/20"
                        >
                            Enter Portal
                        </motion.button>
                    </Link>
                </motion.div>
            </motion.div>

            {/* Footer / Decorative Line */}
            <div className="absolute bottom-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
        </div>
    );
};

export default Home;
