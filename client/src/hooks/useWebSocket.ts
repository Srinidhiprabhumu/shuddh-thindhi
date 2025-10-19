import { useEffect, useRef } from 'react';
import { queryClient } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

export const useWebSocket = (url: string, enabled: boolean = true) => {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const connect = () => {
      try {
        // Close existing connection if any
        if (ws.current) {
          ws.current.close();
        }

        ws.current = new WebSocket(url);

        ws.current.onopen = () => {
          console.log('WebSocket connected');
          reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        };

        ws.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Handle different types of updates
            switch (data.type) {
              case 'CONNECTED':
                console.log('WebSocket connection confirmed');
                break;
              case 'ORDER_CREATED':
                // Invalidate orders query to trigger refresh
                queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
                queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
                toast({
                  title: "New Order Created",
                  description: "Your order has been successfully placed!",
                });
                break;
              case 'ORDER_UPDATED':
                // Invalidate orders query to trigger refresh
                queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
                queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
                toast({
                  title: "Order Status Updated",
                  description: `Your order status has been updated to: ${data.data?.status || 'updated'}`,
                });
                break;
              case 'PRODUCT_UPDATED':
                queryClient.invalidateQueries({ queryKey: ["/api/products"] });
                break;
              default:
                console.log('WebSocket message:', data);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.current.onclose = (event) => {
          console.log(`WebSocket disconnected: ${event.code} ${event.reason}`);
          
          // Only attempt to reconnect if we haven't exceeded max attempts
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff, max 30s
            console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
            setTimeout(connect, delay);
          } else {
            console.log('Max reconnection attempts reached. WebSocket will not reconnect automatically.');
          }
        };

        ws.current.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        // Retry connection after delay if we haven't exceeded max attempts
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          setTimeout(connect, 5000);
        }
      }
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.close(1000, 'Component unmounting'); // Normal closure
        ws.current = null;
      }
    };
  }, [url, enabled]);

  return ws.current;
};