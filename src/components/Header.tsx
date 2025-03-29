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
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isScrolled, setIsScrolled] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      setCurrentTime(`${displayHours}:${minutes} ${period}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

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
  
  const getTimePeriod = () => {
    const hour = new Date().getHours();
    if (hour >= 8 && hour < 12) return 'Breakfast';
    if (hour >= 12 && hour < 16) return 'Lunch';
    if (hour >= 16 && hour < 22) return 'Dinner';
    return 'Late Night';
  };
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${
      theme === 'light' 
        ? 'bg-white/90 border-gray-200' 
        : 'bg-[#1a1a1a]/90 border-gray-800'
    } backdrop-blur-md border-b`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className={`text-xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
              EZ FOOD'S
            </h1>
            <div className={`hidden sm:flex items-center space-x-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'} font-medium`}>
              <Clock className={`h-4 w-4 ${theme === 'light' ? 'text-restaurant-purple' : 'text-restaurant-gold'}`} />
              <span className="font-semibold">{currentTime}</span>
              <span className={`text-sm ${theme === 'light' ? 'text-restaurant-purple' : 'text-restaurant-gold'}`}>|</span>
              <span className={`text-sm ${theme === 'light' ? 'text-restaurant-purple' : 'text-restaurant-gold'}`}>{getTimePeriod()}</span>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-4"
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className={theme === 'light' ? 'text-gray-700' : 'text-white'}
            >
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
