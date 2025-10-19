import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import type { Order } from "@shared/schema";

export const useOrderCount = () => {
  const { isAuthenticated } = useAuth();

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
    refetchInterval: 15000, // Refetch every 15 seconds
    refetchOnWindowFocus: true, // Refetch when window gains focus
    staleTime: 0, // Consider data stale immediately
  });

  const pendingCount = orders.filter(order => 
    order.status === 'pending' || order.status === 'processing'
  ).length;

  const totalCount = orders.length;

  return {
    pendingCount,
    totalCount,
    hasOrders: totalCount > 0,
  };
};