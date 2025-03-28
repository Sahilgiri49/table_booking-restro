
// Table booking system logic

// Check for available tables (in a real app, this would come from a backend)
export const getAvailableTables = (
  currentDate: Date,
  currentTime: string
): number[] => {
  // This is a simulation - in a real app, this would check a database
  // For simulation, we'll make restaurant "full" 20% of the time on even hours
  const hour = currentDate.getHours();
  const isRestaurantBusy = currentDate.getDate() % 5 === 0 && hour % 2 === 0;
  
  // If restaurant is busy, return fewer tables
  if (isRestaurantBusy) {
    return [2, 5, 9]; // Only 3 tables available
  }
  
  // Normal availability
  return [1, 2, 3, 5, 6, 7, 8, 9]; // 8 tables available
};

// Check if restaurant is completely full
export const isRestaurantFull = (
  currentDate: Date,
  currentTime: string
): boolean => {
  // For simulation, restaurant is completely full 5% of the time
  const minute = currentDate.getMinutes();
  return minute % 20 === 0; // Full every 20 minutes for demonstration
};

// Store booked table in localStorage
export const bookTable = (
  tableId: number,
  date: Date,
  time: string
): void => {
  const bookings = JSON.parse(localStorage.getItem('tableBookings') || '[]');
  
  bookings.push({
    tableId,
    date: date.toISOString(),
    time,
    bookedAt: new Date().toISOString()
  });
  
  localStorage.setItem('tableBookings', JSON.stringify(bookings));
};

// Check if user has a booking
export const hasBooking = (): boolean => {
  const bookings = JSON.parse(localStorage.getItem('tableBookings') || '[]');
  return bookings.length > 0;
};

// Get user's current booking
export const getCurrentBooking = () => {
  const bookings = JSON.parse(localStorage.getItem('tableBookings') || '[]');
  if (bookings.length === 0) return null;
  
  // Return the most recent booking
  return bookings[bookings.length - 1];
};
