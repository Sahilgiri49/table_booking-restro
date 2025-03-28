import React, { useState, useEffect } from 'react';
import { Menu, ShoppingCart, Clock, User, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/use-toast';
import Cart from './Cart';
import { MenuItem } from '@/utils/pricingLogic';
import { motion } from 'framer-motion';

interface HeaderProps {
  cartItems: MenuItem[];
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalAmount: number;
  isVip: boolean;
  theme: 'dark' | 'light';
}

const Header: React.FC<HeaderProps> = ({ 
  cartItems, 
  removeFromCart, 
  clearCart,
  totalAmount,
  isVip,
  theme
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isScrolled, setIsScrolled] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const formattedTime = currentTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  });
  
  const getTimePeriod = () => {
    const hour = currentTime.getHours();
    if (hour >= 8 && hour < 12) return 'Breakfast';
    if (hour >= 12 && hour < 16) return 'Lunch';
    if (hour >= 16 && hour < 22) return 'Dinner';
    return 'Late Night';
  };
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-restaurant-dark/80 border-gray-800' 
        : 'bg-white/80 border-gray-200'
    } backdrop-blur-sm border-b`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <motion.div 
            className={`text-xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            GIRI & SON'S
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-4"
          >
            <div className="hidden md:flex items-center mr-4">
              <Clock className="h-4 w-4 text-restaurant-gold mr-1" />
              <span className="text-sm text-white">
                {formattedTime} | {getTimePeriod()}
              </span>
            </div>
            
            <Button variant="ghost" size="icon" className="text-white">
              <User className="h-5 w-5" />
            </Button>
            
            {isVip && (
              <motion.div 
                className={`hidden sm:flex items-center space-x-1 ${
                  theme === 'dark' ? 'text-restaurant-gold' : 'text-restaurant-purple'
                }`}
                animate={{ 
                  textShadow: [
                    "0 0 2px rgba(254, 198, 161, 0)", 
                    "0 0 8px rgba(254, 198, 161, 0.8)", 
                    "0 0 2px rgba(254, 198, 161, 0)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Crown className="h-4 w-4" />
                <span className="text-sm font-medium">VIP</span>
              </motion.div>
            )}
            
            <Sheet>
              <SheetTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative p-2 rounded-full ${
                    theme === 'dark'
                      ? 'bg-restaurant-purple/20 hover:bg-restaurant-purple/30'
                      : 'bg-restaurant-purple/10 hover:bg-restaurant-purple/20'
                  }`}
                >
                  <ShoppingCart className={
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  } />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-restaurant-gold text-black text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </motion.button>
              </SheetTrigger>
              
              <SheetContent className={`${
                theme === 'dark' 
                  ? 'bg-restaurant-dark border-gray-800' 
                  : 'bg-white border-gray-200'
              }`}>
                <SheetHeader>
                  <SheetTitle className={
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }>Your Order</SheetTitle>
                </SheetHeader>
                <Cart 
                  cartItems={cartItems} 
                  removeFromCart={removeFromCart}
                  clearCart={clearCart}
                  totalAmount={totalAmount}
                />
              </SheetContent>
            </Sheet>
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default Header;
