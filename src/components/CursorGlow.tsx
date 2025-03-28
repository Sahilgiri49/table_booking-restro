import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CursorGlow = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return (
    <motion.div
      className="fixed pointer-events-none z-50"
      style={{
        left: mousePosition.x,
        top: mousePosition.y,
        translateX: '-50%',
        translateY: '-50%'
      }}
    >
      <motion.div
        className="rounded-full bg-restaurant-purple mix-blend-overlay"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ 
          scale: 1,
          opacity: 0.15
        }}
        transition={{ duration: 0.2 }}
        style={{
          width: '30px',
          height: '30px',
          filter: 'blur(8px)'
        }}
      />
    </motion.div>
  );
};

export default CursorGlow;
