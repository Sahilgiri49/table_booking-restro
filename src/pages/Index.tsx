import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import MenuCard from '@/components/MenuCard';
import TableBooking from '@/components/TableBooking';
import CursorGlow from '@/components/CursorGlow';
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
import { ChevronDown, Sparkles } from 'lucide-react';

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
  const [activeCategory, setActiveCategory] = useState('All Items');
  const { toast } = useToast();
  const { isVip, unlockedVip } = useVipStatus(totalSpent);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ 
    target: menuRef,
    offset: ["start end", "end start"] 
  });
  
  const rotateX = useTransform(scrollYProgress, [0, 1], [2, -2]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [-2, 2]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.6]);
  
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
  
  const filteredMenuItems = activeCategory === 'All Items' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory.replace(' Courses', '').replace('s', ''));
  
  return (
    <div className="min-h-screen bg-restaurant-dark text-white pb-16 relative overflow-hidden">
      <CursorGlow />
      
      <div className="floating-light w-80 h-80 bg-restaurant-purple top-[-10%] left-[20%]"></div>
      <div className="floating-light w-60 h-60 bg-restaurant-gold bottom-[30%] right-[-5%]"></div>
      <div className="floating-light w-40 h-40 bg-restaurant-accent bottom-[-5%] left-[30%]"></div>
      
      <Header 
        cartItems={cartItems} 
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        totalAmount={calculateTotal()}
        isVip={isVip}
      />
      
      <main className="container mx-auto pt-24 px-4 relative z-10">
        <section className="text-center mb-16 hero-animated py-16">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 1,
              type: "spring", 
              stiffness: 50 
            }}
            className="relative"
          >
            <motion.div 
              className="absolute -top-24 -left-12 w-64 h-64 bg-restaurant-purple opacity-10 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.15, 0.1]
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            
            <motion.div 
              className="absolute top-0 right-0 w-40 h-40 bg-restaurant-gold opacity-10 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 6, repeat: Infinity, delay: 1 }}
            />
            
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold mb-4 tracking-tight"
              style={{ 
                textShadow: "0 0 40px rgba(126, 105, 171, 0.5)" 
              }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-restaurant-gold to-restaurant-accent">Smart Bistro</span> 
              <span className="relative">
                <span className="text-white relative z-10">Adventura</span>
                <motion.span 
                  className="absolute top-0 left-0 w-full h-full bg-restaurant-purple blur-xl opacity-20 -z-10"
                  animate={{ 
                    opacity: [0.2, 0.4, 0.2],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
            >
              Experience dining in a new dimension with real-time dynamic pricing 
              and interactive challenges.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-12 flex justify-center"
            >
              <motion.div
                whileHover={{ y: -5 }}
                whileTap={{ y: 0 }}
                className="animate-bounce"
              >
                <a 
                  href="#menu" 
                  className="flex flex-col items-center text-restaurant-gold opacity-80 hover:opacity-100 transition-opacity"
                >
                  <span className="mb-2">Explore Our Menu</span>
                  <ChevronDown className="h-6 w-6" />
                </a>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>
        
        <AnimatePresence>
          {getPricingNotification() && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-8 text-center"
            >
              <motion.div 
                className="inline-block bg-gradient-to-r from-restaurant-purple to-restaurant-dark px-6 py-3 rounded-full text-white text-sm shadow-glow"
                animate={{ 
                  boxShadow: [
                    "0 0 5px rgba(126, 105, 171, 0.3)", 
                    "0 0 15px rgba(126, 105, 171, 0.7)", 
                    "0 0 5px rgba(126, 105, 171, 0.3)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.span
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block"
                >
                  {getPricingNotification()}
                </motion.span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <section className="mb-12">
          {tableBooked ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fancy-border p-4 rounded-lg text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-restaurant-purple bg-opacity-20 backdrop-blur-sm z-0"></div>
              <motion.div 
                className="relative z-10"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <h2 className="text-lg font-semibold text-restaurant-gold">Your Table is Reserved</h2>
                <p className="text-gray-300">
                  Table #{currentBooking?.tableId} • {' '}
                  {currentBooking?.date ? new Date(currentBooking.date).toLocaleDateString() : ''} • {' '}
                  {currentBooking?.time}
                </p>
              </motion.div>
            </motion.div>
          ) : (
            <TableBooking 
              onTableBooked={handleTableBooked} 
              isRestaurantFull={restaurantFull}
              availableTables={availableTables}
            />
          )}
        </section>
        
        <section className="mb-10" id="menu">
          <div className="flex space-x-2 overflow-x-auto pb-4 scrollbar-hide">
            {['All Items', 'Main Courses', 'Appetizers', 'Desserts', 'Beverages'].map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-300 ${
                  activeCategory === category 
                    ? 'bg-restaurant-purple text-white shadow-lg' 
                    : 'bg-restaurant-dark border border-restaurant-purple text-white'
                }`}
              >
                {category === activeCategory && (
                  <motion.span
                    layoutId="activeCategory"
                    className="absolute inset-0 rounded-full bg-restaurant-purple -z-10"
                  />
                )}
                {category}
              </motion.button>
            ))}
          </div>
        </section>
        
        <motion.section 
          className="mb-20"
          ref={menuRef}
          style={{ perspective: 1000 }}
        >
          <div className="flex items-center justify-between mb-8">
            <motion.h2 
              className="text-2xl font-bold text-restaurant-gold"
              animate={{ y: [0, 3, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              Our Menu
            </motion.h2>
            
            {isVip && (
              <motion.div 
                className="flex items-center text-sm text-restaurant-gold" 
                animate={{ 
                  textShadow: [
                    "0 0 2px rgba(254, 198, 161, 0)", 
                    "0 0 8px rgba(254, 198, 161, 0.8)", 
                    "0 0 2px rgba(254, 198, 161, 0)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                <span>VIP Status Active</span>
              </motion.div>
            )}
          </div>
          
          <motion.div 
            className="menu-scroll-container"
            style={{ 
              rotateX,
              rotateY,
              opacity
            }}
          >
            <div className="menu-scroll-content">
              {filteredMenuItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="menu-item-3d"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: index * 0.05, 
                    duration: 0.5 
                  }}
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
          </motion.div>
        </motion.section>
      </main>
      
      <footer className="bg-restaurant-dark py-6 border-t border-gray-800 relative z-10">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            &copy; {new Date().getFullYear()} Smart Bistro Adventura
          </motion.p>
          <motion.p 
            className="mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Dynamic prices change based on time of day and demand.
          </motion.p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
