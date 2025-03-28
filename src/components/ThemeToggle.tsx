import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => {
  return (
    <motion.button
      onClick={toggleTheme}
      className="fixed top-4 right-20 z-50 p-2 rounded-full bg-restaurant-purple/20 backdrop-blur-sm border border-restaurant-purple/30"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: theme === 'dark' ? 0 : 180,
          scale: theme === 'dark' ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className={`absolute inset-0 flex items-center justify-center ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}
      >
        <Moon className="w-5 h-5 text-yellow-300" />
      </motion.div>
      
      <motion.div
        initial={false}
        animate={{
          rotate: theme === 'light' ? 0 : -180,
          scale: theme === 'light' ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className={`flex items-center justify-center ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`}
      >
        <Sun className="w-5 h-5 text-yellow-500" />
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle; 