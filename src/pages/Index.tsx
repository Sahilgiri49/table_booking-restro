import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import MenuCard from '@/components/MenuCard';
import TableBooking from '@/components/TableBooking';
import { 
  applyDynamicPricing, 
  incrementPageRefreshes, 
  isNewUser, 
  isEligibleForNewUserDiscount,
  MenuItem 
} from '@/utils/pricingLogic';
import { 
  getAvailableTables, 
  isRestaurantFull, 
  bookTable, 
  hasBooking, 
  getCurrentBooking 
} from '@/utils/bookingSystem';
import { useVipStatus, getVipItems } from '@/hooks/useVipStatus';

const initialMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Classic Margherita Pizza',
    description: 'Fresh mozzarella, tomatoes, and basil on our signature crust, baked to perfection in a wood-fired oven.',
    price: 299,
    category: 'Main',
    imageUrl: 'https://images.unsplash.com/photo-1604917877934-07d8d248d396?w=500&h=350&fit=crop'
  },
  {
    id: '2',
    name: 'Truffle Mushroom Risotto',
    description: 'Creamy Arborio rice slowly cooked with wild mushrooms, finished with truffle oil and aged Parmesan.',
    price: 399,
    category: 'Main',
    imageUrl: 'https://images.unsplash.com/photo-1633964913329-61d1162a6ada?w=500&h=350&fit=crop'
  },
  {
    id: '3',
    name: 'Grilled Norwegian Salmon',
    description: 'Fresh Norwegian salmon fillet with lemon herb butter, served with seasonal vegetables and saffron rice.',
    price: 499,
    category: 'Main',
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&h=350&fit=crop'
  },
  {
    id: '4',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with a molten center, served with vanilla bean ice cream and fresh berries.',
    price: 199,
    category: 'Dessert',
    imageUrl: 'https://images.unsplash.com/photo-1631700611307-37dbcb89ef7e?w=500&h=350&fit=crop'
  },
  {
    id: '5',
    name: 'Artisanal Cheese Platter',
    description: 'Selection of premium imported cheeses with artisanal crackers, honeycomb, and wine-poached fruits.',
    price: 349,
    category: 'Appetizer',
    imageUrl: 'https://images.unsplash.com/photo-1543528176-61b239494933?w=500&h=350&fit=crop'
  },
  {
    id: '6',
    name: 'Signature Cocktail',
    description: 'Our award-winning blend of premium spirits, fresh fruit juices, and house-made syrups, served with a unique twist.',
    price: 249,
    category: 'Beverage',
    imageUrl: 'https://images.unsplash.com/photo-1578547953017-64fd63c5cf19?w=500&h=350&fit=crop'
  },
  {
    id: '7',
    name: 'Crispy Calamari',
    description: 'Tender calamari rings, lightly breaded and fried, served with house-made aioli and spicy marinara sauce.',
    price: 279,
    category: 'Appetizer',
    imageUrl: 'https://images.unsplash.com/photo-1625938144207-7140bed11e32?w=500&h=350&fit=crop'
  },
  {
    id: '8',
    name: 'Craft Beer Selection',
    description: 'Rotating selection of local craft beers. Ask server for current options, featuring IPAs, stouts, and lagers.',
    price: 199,
    category: 'Beverage',
    imageUrl: 'https://images.unsplash.com/photo-1600788886242-5c96aabe3757?w=500&h=350&fit=crop'
  },
  {
    id: '9',
    name: 'Wagyu Beef Burger',
    description: 'Premium Wagyu beef patty, aged cheddar, caramelized onions, and truffle aioli on a brioche bun. Served with truffle fries.',
    price: 449,
    category: 'Main',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=350&fit=crop'
  },
  {
    id: '10',
    name: 'Mediterranean Mezze Platter',
    description: 'Housemade hummus, baba ganoush, tzatziki, olives, and warm pita bread. Perfect for sharing.',
    price: 329,
    category: 'Appetizer',
    imageUrl: 'https://images.unsplash.com/photo-1541013406133-94ed77ee8ba8?w=500&h=350&fit=crop'
  },
  {
    id: '11',
    name: 'Lobster Ravioli',
    description: 'Handmade pasta filled with fresh Maine lobster and ricotta, tossed in a saffron cream sauce with cherry tomatoes.',
    price: 559,
    category: 'Main',
    imageUrl: 'https://images.unsplash.com/photo-1622973536968-3ead9e780960?w=500&h=350&fit=crop'
  },
  {
    id: '12',
    name: 'Tiramisu',
    description: 'Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream, dusted with cocoa powder.',
    price: 229,
    category: 'Dessert',
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&h=350&fit=crop'
  }
];

const Index = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [cartItems, setCartItems] = useState<MenuItem[]>([]);
  const [availableTables, setAvailableTables] = useState<number[]>([]);
  const [restaurantFull, setRestaurantFull] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [tableBooked, setTableBooked] = useState<boolean>(false);
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [totalSpent, setTotalSpent] = useState(0);
  const [timeOfDay, setTimeOfDay] = useState<string>('');
  const { toast } = useToast();
  const { isVip, unlockedVip } = useVipStatus(totalSpent);
  
  useEffect(() => {
    const count = incrementPageRefreshes();
    setRefreshCount(count);
    
    if (isNewUser()) {
      toast({
        title: "Welcome to Smart Bistro!",
        description: "First-time visitors get a special discount on their order.",
      });
    } else if (!isEligibleForNewUserDiscount()) {
      toast({
        title: "Welcome Back!",
        description: "You returned quickly! Your new user discount is no longer available.",
        variant: "destructive"
      });
    }
    
    if (hasBooking()) {
      setTableBooked(true);
      setCurrentBooking(getCurrentBooking());
    }
    
    updateAvailableTables();
    
    updatePricing();
    const interval = setInterval(updatePricing, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (unlockedVip) {
      toast({
        title: "VIP Status Unlocked!",
        description: "You've unlocked exclusive VIP menu items!",
      });
    }
  }, [unlockedVip]);
  
  const updatePricing = () => {
    const now = new Date();
    const hour = now.getHours();
    
    let period = '';
    if (hour >= 8 && hour < 12) period = 'Morning';
    else if (hour >= 12 && hour < 16) period = 'Afternoon';
    else if (hour >= 16 && hour < 22) period = 'Evening';
    else period = 'Late Night';
    
    setTimeOfDay(period);
    
    const updatedItems = applyDynamicPricing(initialMenuItems, refreshCount);
    setMenuItems(updatedItems);
    
    if (isVip) {
      const vipItems = getVipItems();
      const pricedVipItems = applyDynamicPricing(vipItems, refreshCount);
      setMenuItems([...updatedItems, ...pricedVipItems]);
    }
    
    updateAvailableTables();
  };
  
  const updateAvailableTables = () => {
    const now = new Date();
    const currentTime = now.getHours() + ':' + now.getMinutes();
    
    setAvailableTables(getAvailableTables(now, currentTime));
    setRestaurantFull(isRestaurantFull(now, currentTime));
  };
  
  const addToCart = (item: MenuItem) => {
    if (!tableBooked) {
      toast({
        title: "Table Required",
        description: "Please book a table before ordering.",
        variant: "destructive"
      });
      return;
    }
    
    setCartItems([...cartItems, { ...item, id: item.id + '-' + Date.now() }]);
    toast({
      title: "Added to Order",
      description: `${item.name} added to your order.`,
    });
  };
  
  const removeFromCart = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };
  
  const clearCart = () => {
    setCartItems([]);
  };
  
  const handleTableBooked = (tableId: number, date: Date, time: string) => {
    bookTable(tableId, date, time);
    setTableBooked(true);
    setCurrentBooking({ tableId, date, time });
  };
  
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price, 0);
  };
  
  const getPricingNotification = () => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 8 && hour < 12) {
      return "Morning Special: 10% off all beverages!";
    } else if (hour >= 12 && hour < 16) {
      return "Peak Hours: Prices are 15% higher during lunch rush.";
    } else if (hour >= 19 && hour < 22) {
      return "Evening Special: Two random items discounted every 10 minutes!";
    } else if (hour >= 22 || hour < 1) {
      return "Late Night Surge: 25% price increase for last orders.";
    } 
    return "";
  };
  
  return (
    <div className="min-h-screen bg-restaurant-dark text-white pb-16 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-restaurant-purple opacity-20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 -right-40 w-80 h-80 bg-restaurant-gold opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-restaurant-accent opacity-10 rounded-full blur-3xl"></div>
      
      <Header 
        cartItems={cartItems} 
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        totalAmount={calculateTotal()}
        isVip={isVip}
      />
      
      <main className="container mx-auto pt-24 px-4 relative z-10">
        <section className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-restaurant-gold to-restaurant-accent"
          >
            Smart Bistro <span className="text-white">Adventura</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Experience dining in a new dimension with real-time dynamic pricing 
            and interactive challenges.
          </motion.p>
          
          <AnimatePresence>
            {getPricingNotification() && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mt-6 inline-block bg-gradient-to-r from-restaurant-purple to-restaurant-dark px-4 py-2 rounded-full text-white text-sm shadow-glow"
              >
                {getPricingNotification()}
              </motion.div>
            )}
          </AnimatePresence>
          
          {isEligibleForNewUserDiscount() && isNewUser() && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-4 text-restaurant-accent font-semibold"
            >
              <motion.span
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="inline-block"
              >
                🎉 New User Discount Applied! Enjoy 10% off your first order.
              </motion.span>
            </motion.div>
          )}
          
          {refreshCount >= 5 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-red-400 text-sm"
            >
              ⚠️ Anti-bot measures activated: Prices increased by 5% due to frequent refreshes.
            </motion.div>
          )}
        </section>
        
        <section className="mb-8">
          {tableBooked ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fancy-border p-4 rounded-lg text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-restaurant-purple bg-opacity-20 backdrop-blur-sm z-0"></div>
              <div className="relative z-10">
                <h2 className="text-lg font-semibold text-restaurant-gold">Your Table is Reserved</h2>
                <p className="text-gray-300">
                  Table #{currentBooking?.tableId} • {' '}
                  {currentBooking?.date ? new Date(currentBooking.date).toLocaleDateString() : ''} • {' '}
                  {currentBooking?.time}
                </p>
              </div>
            </motion.div>
          ) : (
            <TableBooking 
              onTableBooked={handleTableBooked} 
              isRestaurantFull={restaurantFull}
              availableTables={availableTables}
            />
          )}
        </section>
        
        <section className="mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-full bg-restaurant-purple text-white text-sm whitespace-nowrap"
            >
              All Items
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-full bg-restaurant-dark border border-restaurant-purple text-white text-sm whitespace-nowrap"
            >
              Main Courses
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-full bg-restaurant-dark border border-restaurant-purple text-white text-sm whitespace-nowrap"
            >
              Appetizers
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-full bg-restaurant-dark border border-restaurant-purple text-white text-sm whitespace-nowrap"
            >
              Desserts
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-full bg-restaurant-dark border border-restaurant-purple text-white text-sm whitespace-nowrap"
            >
              Beverages
            </motion.button>
          </div>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-restaurant-gold">Our Menu</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <MenuCard 
                  item={item}
                  onAddToCart={addToCart}
                  isDiscounted={!!item.originalPrice}
                  isVipItem={item.isVipOnly}
                />
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      
      <footer className="bg-restaurant-dark py-6 border-t border-gray-800 relative z-10">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Smart Bistro Adventura</p>
          <p className="mt-1">Dynamic prices change based on time of day and demand.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
