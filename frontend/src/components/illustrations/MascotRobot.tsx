import { motion } from 'framer-motion';

export const MascotRobot = ({ className }: { className?: string }) => {
    return (
        <motion.svg
            viewBox="0 0 200 200"
            className={className}
            initial={{ y: 0 }}
            animate={{ y: -15 }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5, ease: "easeInOut" }}
        >
            {/* Antenna */}
            <line x1="100" y1="50" x2="100" y2="30" stroke="#777" strokeWidth="3" />
            <motion.circle
                cx="100" cy="25" r="5" fill="#FF5252"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
            />

            {/* Head */}
            <rect x="70" y="50" width="60" height="50" rx="10" fill="#E0E0E0" stroke="#999" strokeWidth="2" />

            {/* Face Screen */}
            <rect x="75" y="60" width="50" height="30" rx="5" fill="#333" />

            {/* Eyes */}
            <motion.g
                animate={{ x: [0, 2, 0, -2, 0] }} // Scanning movement
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            >
                <circle cx="90" cy="75" r="4" fill="#00E676" />
                <circle cx="110" cy="75" r="4" fill="#00E676" />
            </motion.g>

            {/* Body */}
            <rect x="75" y="105" width="50" height="60" rx="8" fill="#B0BEC5" stroke="#78909C" strokeWidth="2" />

            {/* Arms */}
            <motion.path
                d="M75 120 L55 140" stroke="#999" strokeWidth="5" strokeLinecap="round"
                animate={{ rotate: [0, -10, 0] }}
                style={{ originX: "75px", originY: "120px" }}
                transition={{ repeat: Infinity, duration: 2 }}
            />
            <motion.path
                d="M125 120 L145 140" stroke="#999" strokeWidth="5" strokeLinecap="round"
                animate={{ rotate: [0, 10, 0] }}
                style={{ originX: "125px", originY: "120px" }}
                transition={{ repeat: Infinity, duration: 2 }}
            />

            {/* Buttons */}
            <circle cx="100" cy="125" r="3" fill="#FFEB3B" />
            <circle cx="100" cy="140" r="3" fill="#2196F3" />
            <circle cx="100" cy="155" r="3" fill="#FF5722" />

            {/* Hover Shadow */}
            <motion.ellipse
                cx="100" cy="190" rx="30" ry="5" fill="black" opacity="0.2"
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.1, 0.2] }}
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
            />
        </motion.svg>
    );
};
