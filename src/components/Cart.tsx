import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingCart, Gift } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuItem } from '@/utils/pricingLogic';

interface CartProps {
  cartItems: MenuItem[];
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalAmount: number;
}

const Cart: React.FC<CartProps> = ({ cartItems, removeFromCart, clearCart, totalAmount }) => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const { toast } = useToast();
  
  const handleCheckout = () => {
    setIsCheckoutOpen(true);
    
    const timeout = setTimeout(() => {
      setIsCheckoutOpen(false);
      clearCart();
      toast({
        title: "Session Expired",
        description: "Your checkout session has expired due to inactivity.",
        variant: "destructive"
      });
    }, 2 * 60 * 1000);
    
    setSessionTimeout(timeout);
  };
  
  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }
  };
  
  const processPayment = () => {
    setPaymentProcessing(true);
    
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }
    
    setTimeout(() => {
      const paymentFailed = Math.random() < 0.1;
      
      if (paymentFailed) {
        toast({
          title: "Payment Failed",
          description: "There was an issue processing your payment. Please try again.",
          variant: "destructive"
        });
        setPaymentProcessing(false);
      } else {
        toast({
          title: "Order Confirmed!",
          description: "Your payment was successful. Your order is being prepared.",
        });
        setIsCheckoutOpen(false);
        setPaymentProcessing(false);
        clearCart();
      }
    }, 2000);
  };
  
  const handlePromoCode = () => {
    setPromoError('');
    setPromoSuccess('');
    
    if (promoApplied) {
      setPromoError('You have already applied a discount to this order.');
      return;
    }
    
    if (promoCode.toLowerCase() === 'mystery') {
      setPromoSuccess('Mystery discount applied! 15% off your order.');
      setPromoApplied(true);
    } else {
      setPromoError('Invalid promo code. Try again.');
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center border-b border-gray-700 pb-4 mb-4">
        <ShoppingCart className="h-5 w-5 text-restaurant-gold mr-2" />
        <h2 className="text-xl font-bold text-white">Your Order</h2>
      </div>
      
      {cartItems.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center py-8">
          <ShoppingCart className="h-12 w-12 text-gray-500 mb-4" />
          <p className="text-gray-400">Your cart is empty</p>
          <p className="text-gray-500 text-sm mt-1">Add some delicious items to get started</p>
        </div>
      ) : (
        <>
          <div className="flex-grow overflow-auto">
            <AnimatePresence>
              {cartItems.map(item => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between py-3 border-b border-gray-700"
                >
                  <div className="flex items-center">
                    <div 
                      className="w-12 h-12 rounded-md bg-cover bg-center mr-3"
                      style={{ backgroundImage: `url(${item.imageUrl || '/placeholder.svg'})` }}
                    />
                    <div>
                      <h3 className="text-sm font-medium text-white">{item.name}</h3>
                      <p className="text-xs text-gray-400">₹{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFromCart(item.id)}
                    className="h-8 w-8 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <div className="mt-auto pt-4 border-t border-gray-700">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white">₹{totalAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-sm mb-4">
              <span className="text-gray-400">Tax (5%)</span>
              <span className="text-white">₹{(totalAmount * 0.05).toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between font-bold mb-6">
              <span className="text-white">Total</span>
              <span className="text-restaurant-gold text-lg">
                ₹{(totalAmount * 1.05).toFixed(2)}
              </span>
            </div>
            
            <Button 
              onClick={handleCheckout}
              className="w-full bg-restaurant-gold text-restaurant-dark hover:bg-restaurant-gold/90"
            >
              Checkout
            </Button>
          </div>
        </>
      )}
      
      <Dialog open={isCheckoutOpen} onOpenChange={handleCloseCheckout}>
        <DialogContent className="sm:max-w-[500px] bg-restaurant-dark border-restaurant-purple">
          <DialogTitle className="text-xl text-restaurant-gold">Complete Your Order</DialogTitle>
          <DialogDescription className="text-gray-300">
            Review your order and proceed with payment.
          </DialogDescription>
          
          <div className="py-4 space-y-4">
            <div className="border-b border-gray-700 pb-4">
              <h3 className="font-medium text-white mb-2">Order Summary</h3>
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm py-1">
                  <span className="text-gray-300">{item.name}</span>
                  <span className="text-white">₹{item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex-grow mr-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promo code"
                  className="w-full p-2 rounded-md border border-gray-600 bg-gray-800 text-white"
                />
                {promoError && <p className="text-xs text-red-400 mt-1">{promoError}</p>}
                {promoSuccess && <p className="text-xs text-green-400 mt-1">{promoSuccess}</p>}
              </div>
              <Button 
                onClick={handlePromoCode}
                className="bg-gray-700 hover:bg-gray-600 text-white"
              >
                Apply
              </Button>
            </div>
            
            <div className="border-t border-gray-700 pt-4 mt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Subtotal</span>
                <span className="text-white">₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Tax (5%)</span>
                <span className="text-white">₹{(totalAmount * 0.05).toFixed(2)}</span>
              </div>
              {promoApplied && (
                <div className="flex justify-between mb-2 text-restaurant-accent">
                  <span>Discount (15%)</span>
                  <span>-₹{(totalAmount * 0.15).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg mt-2">
                <span className="text-white">Total</span>
                <span className="text-restaurant-gold">
                  ₹{promoApplied 
                    ? (totalAmount * 1.05 * 0.85).toFixed(2) 
                    : (totalAmount * 1.05).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={handleCloseCheckout}
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={processPayment}
              disabled={paymentProcessing}
              className="bg-restaurant-gold text-restaurant-dark hover:bg-restaurant-gold/90"
            >
              {paymentProcessing ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full" />
                  Processing...
                </>
              ) : (
                'Complete Payment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="mt-4 pt-4 border-t border-gray-700 text-center">
        <a
          href="#"
          className="text-[0.65rem] text-gray-600 hover:text-gray-500 opacity-60"
          onClick={(e) => {
            e.preventDefault();
            setPromoCode('mystery');
            toast({
              title: "Mystery Found!",
              description: "You've unlocked the mystery discount! Apply code 'mystery' at checkout.",
            });
          }}
        >
          <Gift className="h-3 w-3 inline-block mr-1" />
          Restaurant Policy
        </a>
      </div>
    </div>
  );
};

export default Cart;
