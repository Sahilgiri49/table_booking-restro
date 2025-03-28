
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

// Sample menu items
const initialMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Classic Margherita Pizza',
    description: 'Fresh mozzarella, tomatoes, and basil on our signature crust.',
    price: 299,
    category: 'Main',
    imageUrl: '/placeholder.svg'
  },
  {
    id: '2',
    name: 'Truffle Mushroom Risotto',
    description: 'Creamy risotto with wild mushrooms and truffle oil.',
    price: 399,
    category: 'Main',
    imageUrl: '/placeholder.svg'
  },
  {
    id: '3',
    name: 'Grilled Salmon',
    description: 'Norwegian salmon with lemon herb butter and seasonal vegetables.',
    price: 499,
    category: 'Main',
    imageUrl: '/placeholder.svg'
  },
  {
    id: '4',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with a molten center, served with vanilla ice cream.',
    price: 199,
    category: 'Dessert',
    imageUrl: '/placeholder.svg'
  },
  {
    id: '5',
    name: 'Artisanal Cheese Platter',
    description: 'Selection of premium cheeses with crackers, nuts, and honey.',
    price: 349,
    category: 'Appetizer',
    imageUrl: '/placeholder.svg'
  },
  {
    id: '6',
    name: 'Signature Cocktail',
    description: 'House special blend of premium spirits with fresh fruit juices.',
    price: 249,
    category: 'Beverage',
    imageUrl: '/placeholder.svg'
  },
  {
    id: '7',
    name: 'Crispy Calamari',
    description: 'Tender calamari rings, lightly breaded and fried, served with aioli.',
    price: 279,
    category: 'Appetizer',
    imageUrl: '/placeholder.svg'
  },
  {
    id: '8',
    name: 'Craft Beer Selection',
    description: 'Rotating selection of local craft beers. Ask server for current options.',
    price: 199,
    category: 'Beverage',
    imageUrl: '/placeholder.svg'
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
  
  // Initialize page and apply pricing
  useEffect(() => {
    // Check page refreshes
    const count = incrementPageRefreshes();
    setRefreshCount(count);
    
    // Check if user is new for welcome message
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
    
    // Check for existing booking
    if (hasBooking()) {
      setTableBooked(true);
      setCurrentBooking(getCurrentBooking());
    }
    
    // Get available tables
    updateAvailableTables();
    
    // Set up time-based price updates
    updatePricing();
    const interval = setInterval(updatePricing, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  // Show VIP unlocked message
  useEffect(() => {
    if (unlockedVip) {
      toast({
        title: "VIP Status Unlocked!",
        description: "You've unlocked exclusive VIP menu items!",
      });
    }
  }, [unlockedVip]);
  
  // Update pricing based on time of day
  const updatePricing = () => {
    const now = new Date();
    const hour = now.getHours();
    
    // Determine time of day for UI
    let period = '';
    if (hour >= 8 && hour < 12) period = 'Morning';
    else if (hour >= 12 && hour < 16) period = 'Afternoon';
    else if (hour >= 16 && hour < 22) period = 'Evening';
    else period = 'Late Night';
    
    setTimeOfDay(period);
    
    // Apply dynamic pricing
    const updatedItems = applyDynamicPricing(initialMenuItems, refreshCount);
    setMenuItems(updatedItems);
    
    // Get VIP items if user is VIP
    if (isVip) {
      const vipItems = getVipItems();
      const pricedVipItems = applyDynamicPricing(vipItems, refreshCount);
      setMenuItems([...updatedItems, ...pricedVipItems]);
    }
    
    // Update available tables (tables may change throughout the day)
    updateAvailableTables();
  };
  
  // Update available tables
  const updateAvailableTables = () => {
    const now = new Date();
    const currentTime = now.getHours() + ':' + now.getMinutes();
    
    setAvailableTables(getAvailableTables(now, currentTime));
    setRestaurantFull(isRestaurantFull(now, currentTime));
  };
  
  // Add item to cart
  const addToCart = (item: MenuItem) => {
    // Check if table is booked
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
  
  // Remove item from cart
  const removeFromCart = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };
  
  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };
  
  // Handle table booking
  const handleTableBooked = (tableId: number, date: Date, time: string) => {
    bookTable(tableId, date, time);
    setTableBooked(true);
    setCurrentBooking({ tableId, date, time });
  };
  
  // Calculate total amount spent
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price, 0);
  };
  
  // Get pricing notification based on time of day
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
    <div className="min-h-screen bg-restaurant-dark text-white pb-16">
      <Header 
        cartItems={cartItems} 
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        totalAmount={calculateTotal()}
        isVip={isVip}
      />
      
      <main className="container mx-auto pt-24 px-4">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold mb-4 text-restaurant-gold"
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
          
          {/* Time-based pricing notification */}
          <AnimatePresence>
            {getPricingNotification() && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mt-6 inline-block bg-restaurant-purple px-4 py-2 rounded-full text-white text-sm"
              >
                {getPricingNotification()}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* New user discount notification */}
          {isEligibleForNewUserDiscount() && isNewUser() && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-4 text-restaurant-accent font-semibold"
            >
              🎉 New User Discount Applied! Enjoy 10% off your first order.
            </motion.div>
          )}
          
          {/* Refresh warning */}
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
        
        {/* Booking Status */}
        <section className="mb-8">
          {tableBooked ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-restaurant-purple bg-opacity-20 p-4 rounded-lg text-center"
            >
              <h2 className="text-lg font-semibold text-restaurant-gold">Your Table is Reserved</h2>
              <p className="text-gray-300">
                Table #{currentBooking?.tableId} • {' '}
                {currentBooking?.date ? new Date(currentBooking.date).toLocaleDateString() : ''} • {' '}
                {currentBooking?.time}
              </p>
            </motion.div>
          ) : (
            <TableBooking 
              onTableBooked={handleTableBooked} 
              isRestaurantFull={restaurantFull}
              availableTables={availableTables}
            />
          )}
        </section>
        
        {/* Menu Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-restaurant-gold">Menu</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {menuItems.map(item => (
              <MenuCard 
                key={item.id}
                item={item}
                onAddToCart={addToCart}
                isDiscounted={!!item.originalPrice}
                isVipItem={item.isVipOnly}
              />
            ))}
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-restaurant-dark py-6 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Smart Bistro Adventura</p>
          <p className="mt-1">Dynamic prices change based on time of day and demand.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
