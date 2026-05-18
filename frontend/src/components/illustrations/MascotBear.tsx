import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export const MascotBear = ({ className }: { className?: string }) => {
    const [blink, setBlink] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setBlink(true);
            setTimeout(() => setBlink(false), 200);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.svg
            viewBox="0 0 200 200"
            className={className}
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 2, ease: "easeInOut" }}
        >
            {/* Body */}
            <circle cx="100" cy="110" r="60" fill="#ECA646" />
            <circle cx="100" cy="110" r="45" fill="#F4D3A1" />

            {/* Ears */}
            <circle cx="60" cy="65" r="18" fill="#ECA646" />
            <circle cx="140" cy="65" r="18" fill="#ECA646" />
            <circle cx="60" cy="65" r="10" fill="#F4D3A1" />
            <circle cx="140" cy="65" r="10" fill="#F4D3A1" />

            {/* Eyes */}
            <motion.g animate={{ scaleY: blink ? 0.1 : 1 }} transition={{ duration: 0.1 }}>
                <circle cx="85" cy="100" r="6" fill="#333" />
                <circle cx="115" cy="100" r="6" fill="#333" />
                <circle cx="87" cy="98" r="2" fill="white" />
                <circle cx="117" cy="98" r="2" fill="white" />
            </motion.g>

            {/* Nose/Mouth */}
            <ellipse cx="100" cy="115" rx="12" ry="8" fill="#5D3A1A" />
            <path d="M100 115 L100 125 M95 125 Q100 130 105 125" stroke="#5D3A1A" strokeWidth="2" fill="none" />

            {/* Paws */}
            <motion.circle
                cx="50" cy="140" r="12" fill="#ECA646"
                animate={{ y: [0, -5, 0] }}
                transition={{ delay: 0.5, duration: 2, repeat: Infinity }}
            />
            <motion.circle
                cx="150" cy="140" r="12" fill="#ECA646"
                animate={{ y: [0, -5, 0] }}
                transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
            />
        </motion.svg>
    );
};
