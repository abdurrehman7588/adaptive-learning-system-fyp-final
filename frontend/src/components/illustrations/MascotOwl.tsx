import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export const MascotOwl = ({ className }: { className?: string }) => {
    const [blink, setBlink] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setBlink(true);
            setTimeout(() => setBlink(false), 200);
        }, 3500); // Owls blink differently!
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.svg
            viewBox="0 0 200 200"
            className={className}
            initial={{ rotate: -2 }}
            animate={{ rotate: 2 }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 3, ease: "easeInOut" }}
        >
            {/* Body */}
            <ellipse cx="100" cy="110" rx="60" ry="70" fill="#7C93C3" />
            <path d="M70 110 Q100 140 130 110" fill="#E6EDF5" opacity="0.5" />

            {/* Wings */}
            <path d="M40 110 Q20 130 40 160" stroke="#556994" strokeWidth="3" fill="none" />
            <path d="M160 110 Q180 130 160 160" stroke="#556994" strokeWidth="3" fill="none" />

            {/* Head Feathers */}
            <path d="M70 60 L60 40 L80 50 Z" fill="#7C93C3" />
            <path d="M130 60 L140 40 L120 50 Z" fill="#7C93C3" />

            {/* Eyes (Big!) */}
            <g>
                <circle cx="80" cy="90" r="18" fill="white" stroke="#556994" strokeWidth="2" />
                <circle cx="120" cy="90" r="18" fill="white" stroke="#556994" strokeWidth="2" />

                <motion.g animate={{ scaleY: blink ? 0.1 : 1 }} transition={{ duration: 0.1 }}>
                    <circle cx="80" cy="90" r="8" fill="#333" />
                    <circle cx="120" cy="90" r="8" fill="#333" />
                    <circle cx="83" cy="87" r="3" fill="white" />
                    <circle cx="123" cy="87" r="3" fill="white" />
                </motion.g>
            </g>

            {/* Beak */}
            <path d="M95 105 L105 105 L100 115 Z" fill="#FFC107" />

            {/* Feet */}
            <path d="M85 178 L85 185 M90 178 L90 185 M80 178 L80 185" stroke="#ECA646" strokeWidth="3" />
            <path d="M115 178 L115 185 M120 178 L120 185 M110 178 L110 185" stroke="#ECA646" strokeWidth="3" />
        </motion.svg>
    );
};
