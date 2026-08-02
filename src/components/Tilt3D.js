import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
const Tilt3D = ({ children, className = '', maxTilt = 12 }) => {
    const ref = useRef(null);
    const [hovered, setHovered] = useState(false);
    // Mouse positions as motion values
    const x = useMotionValue(0.5);
    const y = useMotionValue(0.5);
    // Create springs for smooth movement
    const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
    const rotateX = useSpring(useTransform(y, [0, 1], [maxTilt, -maxTilt]), springConfig);
    const rotateY = useSpring(useTransform(x, [0, 1], [-maxTilt, maxTilt]), springConfig);
    // Glare overlay positioning
    const glareX = useSpring(useTransform(x, [0, 1], ['0%', '100%']), springConfig);
    const glareY = useSpring(useTransform(y, [0, 1], ['0%', '100%']), springConfig);
    const glareOpacity = useSpring(useTransform(x, [0, 0.5, 1], [0.4, 0, 0.4]), springConfig);
    const handleMouseMove = (e) => {
        if (!ref.current)
            return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        // Normalize coordinates between 0 and 1
        const mouseX = (e.clientX - rect.left) / width;
        const mouseY = (e.clientY - rect.top) / height;
        x.set(mouseX);
        y.set(mouseY);
    };
    const handleMouseEnter = () => {
        setHovered(true);
    };
    const handleMouseLeave = () => {
        setHovered(false);
        // Reset rotations to center
        x.set(0.5);
        y.set(0.5);
    };
    return (_jsx("div", { ref: ref, onMouseMove: handleMouseMove, onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, className: `relative ${className}`, style: { perspective: 1000 }, children: _jsxs(motion.div, { style: {
                rotateX: rotateX,
                rotateY: rotateY,
                transformStyle: 'preserve-3d',
            }, className: "w-full h-full relative", children: [children, _jsx(motion.div, { className: "absolute inset-0 pointer-events-none rounded-2xl z-20", style: {
                        background: `radial-gradient(circle 200px at ${glareX} ${glareY}, rgba(255, 255, 255, 0.12), transparent)`,
                        opacity: hovered ? glareOpacity : 0,
                        transition: 'opacity 0.3s ease',
                    } })] }) }));
};
export default Tilt3D;
