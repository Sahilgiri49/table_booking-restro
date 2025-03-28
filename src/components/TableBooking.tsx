
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import RestaurantScene from './RestaurantScene';
import { motion } from 'framer-motion';

interface TableBookingProps {
  onTableBooked: (tableId: number, date: Date, time: string) => void;
  isRestaurantFull: boolean;
  availableTables: number[];
}

const TableBooking: React.FC<TableBookingProps> = ({ 
  onTableBooked, 
  isRestaurantFull,
  availableTables
}) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>('19:00');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [lastBookingAttempt, setLastBookingAttempt] = useState<number>(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const { toast } = useToast();
  
  const timeSlots = [
    '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '18:00', '19:00', '20:00', '21:00'
  ];
  
  // Handle blocking logic
  useEffect(() => {
    if (isBlocked) {
      const interval = setInterval(() => {
        const secondsLeft = Math.max(0, Math.ceil(
          (lastBookingAttempt + 5 * 60 * 1000 - Date.now()) / 1000
        ));
        
        setBlockTimeRemaining(secondsLeft);
        
        if (secondsLeft === 0) {
          setIsBlocked(false);
          clearInterval(interval);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isBlocked, lastBookingAttempt]);
  
  const handleBookTable = () => {
    if (isBlocked) {
      toast({
        title: "Booking Blocked",
        description: `You're temporarily blocked from booking. Please try again in ${Math.floor(blockTimeRemaining / 60)}:${(blockTimeRemaining % 60).toString().padStart(2, '0')}`,
        variant: "destructive"
      });
      return;
    }
    
    const now = Date.now();
    if (now - lastBookingAttempt < 30000) { // 30 seconds
      setIsBlocked(true);
      setLastBookingAttempt(now);
      toast({
        title: "Too Many Booking Attempts",
        description: "You've been blocked from booking for 5 minutes due to multiple attempts.",
        variant: "destructive"
      });
      return;
    }
    
    setLastBookingAttempt(now);
    
    if (!date || !time || !selectedTable) {
      toast({
        title: "Incomplete Booking",
        description: "Please select a date, time, and table before booking.",
        variant: "destructive"
      });
      return;
    }
    
    onTableBooked(selectedTable, date, time);
    setIsDialogOpen(false);
    setSelectedTable(null);
    
    toast({
      title: "Table Booked Successfully",
      description: `Your table #${selectedTable} is confirmed for ${format(date, 'PP')} at ${time}`,
    });
  };
  
  const handleTableSelect = (tableId: number) => {
    setSelectedTable(tableId);
    toast({
      title: `Table ${tableId} Selected`,
      description: "Please confirm your booking by clicking the Book Now button.",
    });
  };
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <Button className="w-full mt-4 bg-restaurant-gold text-restaurant-dark hover:bg-restaurant-gold/90 shadow-gold-glow">
            Book a Table
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-restaurant-dark border-restaurant-purple">
        <DialogHeader>
          <DialogTitle className="text-2xl text-restaurant-gold">Reserve Your Table</DialogTitle>
          <DialogDescription className="text-gray-300">
            Pick a date, time, and table for your dining experience.
          </DialogDescription>
        </DialogHeader>
        
        {isRestaurantFull ? (
          <div className="text-center py-6">
            <h3 className="text-xl text-restaurant-accent mb-2">Restaurant is Currently Full</h3>
            <p className="text-gray-300 mb-4">You've been added to our waiting list. We'll notify you when a table becomes available.</p>
            <Button 
              onClick={() => setIsDialogOpen(false)}
              className="bg-restaurant-purple hover:bg-restaurant-purple/90"
            >
              Close
            </Button>
          </div>
        ) : isBlocked ? (
          <div className="text-center py-6">
            <h3 className="text-xl text-destructive mb-2">Booking Temporarily Blocked</h3>
            <p className="text-gray-300 mb-2">Too many booking attempts detected.</p>
            <div className="text-lg font-mono text-restaurant-gold mb-4">
              {Math.floor(blockTimeRemaining / 60)}:{(blockTimeRemaining % 60).toString().padStart(2, '0')}
            </div>
            <Button 
              onClick={() => setIsDialogOpen(false)}
              className="bg-restaurant-purple hover:bg-restaurant-purple/90"
            >
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <div className="w-full sm:w-1/2">
                <label className="block text-sm font-medium text-gray-200 mb-1">Select Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-gray-600 bg-gray-800 text-white"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="bg-gray-800 text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="w-full sm:w-1/2">
                <label className="block text-sm font-medium text-gray-200 mb-1">Select Time</label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-2 rounded-md border border-gray-600 bg-gray-800 text-white"
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">Select a Table</label>
              <div className="border border-gray-700 rounded-lg overflow-hidden">
                <RestaurantScene 
                  availableTables={availableTables} 
                  onTableSelect={handleTableSelect} 
                />
              </div>
              {selectedTable && (
                <p className="mt-2 text-center text-restaurant-gold">
                  Table #{selectedTable} selected
                </p>
              )}
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={handleBookTable}
                disabled={!date || !time || !selectedTable}
                className="w-full bg-restaurant-gold text-restaurant-dark hover:bg-restaurant-gold/90 shadow-lg"
              >
                Book Now
              </Button>
            </motion.div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TableBooking;
