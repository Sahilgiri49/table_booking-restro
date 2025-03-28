
import React, { useState, useEffect } from 'react';
import { Menu, ShoppingCart, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/use-toast';
import Cart from './Cart';

interface HeaderProps {
  cartItems: MenuItem[];
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalAmount: number;
  isVip: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  cartItems, 
  removeFromCart, 
  clearCart,
  totalAmount,
  isVip
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isScrolled, setIsScrolled] = useState(false);
  const { toast } = useToast();
  
  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle scroll effect
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
  
  // Determine time period for display
  const getTimePeriod = () => {
    const hour = currentTime.getHours();
    if (hour >= 8 && hour < 12) return 'Breakfast';
    if (hour >= 12 && hour < 16) return 'Lunch';
    if (hour >= 16 && hour < 22) return 'Dinner';
    return 'Late Night';
  };
  
  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-restaurant-dark bg-opacity-90 shadow-md' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2 text-white">
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-xl md:text-2xl font-semibold text-white">
              Smart <span className="text-restaurant-gold">Bistro</span>
            </h1>
            {isVip && (
              <span className="ml-2 px-2 py-1 bg-restaurant-gold text-restaurant-dark text-xs rounded-full animate-pulse-soft">
                VIP
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-1 md:space-x-4">
            <div className="hidden md:flex items-center mr-4">
              <Clock className="h-4 w-4 text-restaurant-gold mr-1" />
              <span className="text-sm text-white">
                {formattedTime} | {getTimePeriod()}
              </span>
            </div>
            
            <Button variant="ghost" size="icon" className="text-white">
              <User className="h-5 w-5" />
            </Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-white">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-restaurant-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-restaurant-dark border-restaurant-purple">
                <Cart 
                  cartItems={cartItems} 
                  removeFromCart={removeFromCart}
                  clearCart={clearCart}
                  totalAmount={totalAmount}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
