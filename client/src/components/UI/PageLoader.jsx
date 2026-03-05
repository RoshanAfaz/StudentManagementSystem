import React from 'react';
import { motion } from 'framer-motion';

const PageLoader = () => {
    return (
        <div className="flex items-center justify-center h-screen w-full bg-background/50 backdrop-blur-sm z-50">
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                    borderRadius: ["20%", "50%", "20%"]
                }}
                transition={{
                    duration: 2,
                    ease: "easeInOut",
                    times: [0, 0.5, 1],
                    repeat: Infinity
                }}
                className="w-16 h-16 bg-primary shadow-xl"
            />
        </div>
    );
};

export default PageLoader;
