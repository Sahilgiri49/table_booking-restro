
import { useState, useEffect } from 'react';

// VIP status hook
export const useVipStatus = (totalSpent: number) => {
  const [isVip, setIsVip] = useState(false);
  const [unlockedVip, setUnlockedVip] = useState(false);
  
  useEffect(() => {
    // Check localStorage for existing VIP status
    const storedVipStatus = localStorage.getItem('vipStatus');
    if (storedVipStatus === 'true') {
      setIsVip(true);
    }
    
    // Check if user has spent enough to unlock VIP
    if (totalSpent >= 1000 && !isVip) {
      setIsVip(true);
      setUnlockedVip(true);
      localStorage.setItem('vipStatus', 'true');
    }
  }, [totalSpent, isVip]);
  
  return { isVip, unlockedVip };
};

// Get VIP menu items
export const getVipItems = () => {
  return [
    {
      id: 'vip-1',
      name: 'Chef\'s Secret Truffle Pasta',
      description: 'Hand-crafted pasta with black truffle shavings and 24-month aged Parmesan.',
      price: 899,
      category: 'Main',
      imageUrl: '/placeholder.svg',
      isVipOnly: true
    },
    {
      id: 'vip-2',
      name: 'Gold Leaf Chocolate Dome',
      description: 'Premium dark chocolate sphere with molten center and 24k edible gold leaf.',
      price: 699,
      category: 'Dessert',
      imageUrl: '/placeholder.svg',
      isVipOnly: true
    },
    {
      id: 'vip-3',
      name: 'Aged Whiskey Flight',
      description: 'Collection of rare aged whiskeys from around the world, served with artisanal ice.',
      price: 1499,
      category: 'Beverage',
      imageUrl: '/placeholder.svg',
      isVipOnly: true
    }
  ];
};
