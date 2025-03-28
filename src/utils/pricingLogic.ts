
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  imageUrl?: string;
  isVipOnly?: boolean;
}

// Count page refreshes using localStorage
export const incrementPageRefreshes = (): number => {
  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;
  
  // Get stored refresh data
  const refreshData = localStorage.getItem('pageRefreshes');
  let refreshes: { count: number; timestamp: number } = refreshData 
    ? JSON.parse(refreshData) 
    : { count: 0, timestamp: now };
  
  // Reset if older than a minute
  if (refreshes.timestamp < oneMinuteAgo) {
    refreshes = { count: 1, timestamp: now };
  } else {
    refreshes.count += 1;
  }
  
  localStorage.setItem('pageRefreshes', JSON.stringify(refreshes));
  return refreshes.count;
};

// Apply dynamic pricing based on time of day and other factors
export const applyDynamicPricing = (
  menuItems: MenuItem[], 
  refreshCount: number
): MenuItem[] => {
  const now = new Date();
  const hour = now.getHours();
  
  // Apply anti-bot pricing if too many refreshes (5 or more in a minute)
  const antiBotMultiplier = refreshCount >= 5 ? 1.05 : 1;
  
  return menuItems.map(item => {
    let priceMultiplier = 1;
    let updatedItem = { ...item };
    
    // Morning discount on beverages (8 AM - 11 AM)
    if (hour >= 8 && hour < 12 && item.category === 'Beverage') {
      priceMultiplier *= 0.9; // 10% discount
    }
    
    // Afternoon peak pricing (12 PM - 3 PM)
    if (hour >= 12 && hour < 16) {
      priceMultiplier *= 1.15; // 15% increase
    }
    
    // Evening random discounts (7 PM - 10 PM)
    if (hour >= 19 && hour < 22) {
      // Randomly select two items for discount
      // Implementation would generate a consistent random selection based on the current 10-minute window
      const tenMinuteWindow = Math.floor(now.getMinutes() / 10);
      const seed = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${hour}-${tenMinuteWindow}`;
      const hashCode = Array.from(seed).reduce(
        (acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0
      );
      
      // Use the hash to "randomly" but consistently select items
      if ((Math.abs(hashCode) + item.id.charCodeAt(0)) % 7 === 0) {
        const discountPercent = 5 + (Math.abs(hashCode) % 16); // 5-20% discount
        priceMultiplier *= (1 - discountPercent / 100);
        updatedItem.originalPrice = item.price;
      }
    }
    
    // Late night surge (10 PM - 12 AM)
    if (hour >= 22 || hour < 1) {
      priceMultiplier *= 1.25; // 25% increase
    }
    
    // Apply anti-bot pricing
    priceMultiplier *= antiBotMultiplier;
    
    // Update price
    updatedItem.price = parseFloat((item.price * priceMultiplier).toFixed(2));
    
    return updatedItem;
  });
};

// Check if user is a first-time visitor
export const isNewUser = (): boolean => {
  const visited = localStorage.getItem('hasVisited');
  if (!visited) {
    localStorage.setItem('hasVisited', 'true');
    localStorage.setItem('firstVisitTime', Date.now().toString());
    return true;
  }
  return false;
};

// Check if user is eligible for new user discount
export const isEligibleForNewUserDiscount = (): boolean => {
  const visited = localStorage.getItem('hasVisited');
  const firstVisitTime = localStorage.getItem('firstVisitTime');
  
  if (!visited) {
    return true;
  }
  
  // If returning within 10 minutes, no discount
  if (firstVisitTime) {
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    if (parseInt(firstVisitTime) > tenMinutesAgo) {
      return false;
    }
  }
  
  return true;
};
