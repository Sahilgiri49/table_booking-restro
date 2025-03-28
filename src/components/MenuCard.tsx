
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, DollarSign, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { MenuItem } from '@/utils/pricingLogic';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  isDiscounted?: boolean;
  isVipItem?: boolean;
}

const MenuCard: React.FC<MenuCardProps> = ({ 
  item, 
  onAddToCart, 
  isDiscounted = false,
  isVipItem = false
}) => {
  const [showPrice, setShowPrice] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hasLoaded, setHasLoaded] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (isDiscounted) {
      setShowPrice(false);
      const timer = setTimeout(() => setShowPrice(true), 100);
      return () => clearTimeout(timer);
    }
  }, [item.price, isDiscounted]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    setMousePosition({ x, y });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: hasLoaded ? 1 : 0, 
        y: hasLoaded ? 0 : 20,
        rotateX: isHovered ? 2 : 0,
        rotateY: isHovered ? 2 : 0
      }}
      transition={{ 
        duration: 0.5,
        rotateX: { duration: 0.2 },
        rotateY: { duration: 0.2 }
      }}
      className={`${isVipItem ? 'vip-item' : 'menu-card'} h-full relative group perspective-800 preserve-3d`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      whileHover={{ 
        z: 10,
        boxShadow: isVipItem 
          ? "0 20px 25px -5px rgba(254, 198, 161, 0.4)" 
          : "0 20px 25px -5px rgba(126, 105, 171, 0.4)"
      }}
    >
      {/* Mouse follow glow effect */}
      <div 
        className="absolute rounded-full opacity-0 group-hover:opacity-20 pointer-events-none blur-3xl transition-opacity duration-300 z-0"
        style={{
          background: isVipItem ? 'radial-gradient(circle, rgba(254,198,161,1) 0%, rgba(254,198,161,0) 70%)' : 
                                 'radial-gradient(circle, rgba(126,105,171,1) 0%, rgba(126,105,171,0) 70%)',
          width: '150px',
          height: '150px',
          transform: `translate(${mousePosition.x - 75}px, ${mousePosition.y - 75}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      />
      
      {/* Glow effect overlay */}
      <div className={`absolute inset-0 rounded-lg ${isVipItem ? 'bg-restaurant-gold' : 'bg-restaurant-purple'} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 z-0`}></div>
      
      <Card className="h-full border-0 bg-transparent overflow-hidden relative z-10 backface-hidden transform-gpu">
        <CardContent className="p-0 h-full preserve-3d">
          <div className="relative overflow-hidden rounded-t-lg">
            <motion.div 
              className="h-48 bg-center bg-cover bg-no-repeat"
              style={{ 
                backgroundImage: `url(${item.imageUrl || '/placeholder.svg'})` 
              }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.7 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
            
            {isVipItem && (
              <motion.div 
                className="absolute top-2 right-2 bg-restaurant-gold px-2 py-1 rounded-md text-restaurant-dark text-xs font-bold z-10 flex items-center gap-1"
                animate={{ 
                  scale: [1, 1.05, 1],
                  boxShadow: ["0 0 0px rgba(254,198,161,0.3)", "0 0 10px rgba(254,198,161,0.8)", "0 0 0px rgba(254,198,161,0.3)"]
                }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Sparkles className="h-3 w-3" />
                <span>VIP EXCLUSIVE</span>
              </motion.div>
            )}
            
            {isDiscounted && (
              <motion.div 
                className="absolute top-2 left-2 bg-restaurant-accent px-2 py-1 rounded-md text-white text-xs font-bold z-10"
                animate={{ 
                  y: [0, -2, 0],
                  boxShadow: ["0 0 0px rgba(217,70,239,0.3)", "0 0 10px rgba(217,70,239,0.8)", "0 0 0px rgba(217,70,239,0.3)"]
                }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                SPECIAL OFFER
              </motion.div>
            )}
          </div>
          
          <div className="p-4 flex flex-col h-[calc(100%-12rem)] backdrop-blur-sm bg-opacity-10 bg-black">
            <h3 className="text-lg font-semibold mb-1 text-white">{item.name}</h3>
            <p className="text-sm text-gray-300 mb-3 line-clamp-2 flex-grow">{item.description}</p>
            
            <div className="flex items-end justify-between mt-auto">
              <div className="flex items-center">
                <motion.div 
                  animate={{ rotate: [0, 5, 0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 5 }}
                >
                  <DollarSign className={`h-4 w-4 ${isVipItem ? 'text-restaurant-gold' : 'text-restaurant-accent'}`} />
                </motion.div>
                {showPrice ? (
                  <motion.span 
                    key={`price-${item.price}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      textShadow: isHovered ? (isVipItem ? "0 0 8px rgba(254, 198, 161, 0.8)" : "0 0 8px rgba(217, 70, 239, 0.8)") : "none"
                    }}
                    className={`text-lg font-bold ${isVipItem ? 'text-restaurant-gold' : 'text-restaurant-accent'}`}
                  >
                    ₹{item.price.toFixed(2)}
                  </motion.span>
                ) : null}
                
                {item.originalPrice && item.originalPrice > item.price && (
                  <motion.span 
                    className="ml-2 text-sm text-gray-400 line-through"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    ₹{item.originalPrice.toFixed(2)}
                  </motion.span>
                )}
              </div>
              
              <div className="relative overflow-hidden">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="sm" 
                    onClick={() => onAddToCart(item)}
                    className={`${isVipItem ? 'bg-restaurant-gold text-restaurant-dark hover:bg-opacity-90' : 'bg-restaurant-purple hover:bg-opacity-90'} transition-all duration-300 shadow-lg`}
                  >
                    <motion.div
                      whileHover={{ rotate: [0, -15, 15, -15, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                    </motion.div>
                    Add
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MenuCard;
