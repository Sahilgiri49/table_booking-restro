
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

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
  
  // Animation for price changes
  useEffect(() => {
    if (isDiscounted) {
      setShowPrice(false);
      const timer = setTimeout(() => setShowPrice(true), 100);
      return () => clearTimeout(timer);
    }
  }, [item.price, isDiscounted]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${isVipItem ? 'vip-item' : 'menu-card'} h-full`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="h-full border-0 bg-transparent">
        <CardContent className="p-0 h-full">
          <div className="relative overflow-hidden rounded-t-lg">
            <div 
              className="h-48 bg-center bg-cover transition-transform duration-700"
              style={{ 
                backgroundImage: `url(${item.imageUrl || '/placeholder.svg'})`,
                transform: isHovered ? 'scale(1.1)' : 'scale(1)'
              }}
            />
            
            {isVipItem && (
              <div className="absolute top-2 right-2 bg-restaurant-gold px-2 py-1 rounded-md text-restaurant-dark text-xs font-bold">
                VIP EXCLUSIVE
              </div>
            )}
            
            {isDiscounted && (
              <div className="absolute top-2 left-2 bg-restaurant-accent px-2 py-1 rounded-md text-white text-xs font-bold animate-pulse-soft">
                SPECIAL OFFER
              </div>
            )}
          </div>
          
          <div className="p-4 flex flex-col h-[calc(100%-12rem)]">
            <h3 className="text-lg font-semibold mb-1 text-white">{item.name}</h3>
            <p className="text-sm text-gray-300 mb-3 line-clamp-2 flex-grow">{item.description}</p>
            
            <div className="flex items-end justify-between mt-auto">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-restaurant-gold" />
                {showPrice ? (
                  <motion.span 
                    key={`price-${item.price}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-lg font-bold text-restaurant-gold"
                  >
                    ₹{item.price.toFixed(2)}
                  </motion.span>
                ) : null}
                
                {item.originalPrice && item.originalPrice > item.price && (
                  <span className="ml-2 text-sm text-gray-400 line-through">
                    ₹{item.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              
              <Button 
                size="sm" 
                onClick={() => onAddToCart(item)}
                className={`${isVipItem ? 'bg-restaurant-gold text-restaurant-dark hover:bg-opacity-90' : 'bg-restaurant-purple hover:bg-opacity-90'} transition-all duration-300`}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MenuCard;
