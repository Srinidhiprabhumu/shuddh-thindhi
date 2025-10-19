import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

export const useOrderUpdates = (enabled: boolean = true) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    // Listen for storage events (for cross-tab communication)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'order-update') {
        const data = JSON.parse(e.newValue || '{}');
        
        // Invalidate queries to trigger refresh
        queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
        
        // Show toast notification
        if (data.type === 'ORDER_CREATED') {
          toast({
            title: "Order Placed Successfully!",
            description: "Your order has been created and is being processed.",
          });
        } else if (data.type === 'ORDER_UPDATED') {
          toast({
            title: "Order Status Updated",
            description: `Your order status has been updated.`,
          });
        }
        
        // Clear the storage item
        localStorage.removeItem('order-update');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [enabled, queryClient]);

  // Function to trigger order update notification
  const triggerOrderUpdate = (type: 'ORDER_CREATED' | 'ORDER_UPDATED', data?: any) => {
    const updateData = { type, data, timestamp: Date.now() };
    localStorage.setItem('order-update', JSON.stringify(updateData));
    
    // Trigger the event manually for the current tab
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'order-update',
      newValue: JSON.stringify(updateData)
    }));
  };

  return { triggerOrderUpdate };
};