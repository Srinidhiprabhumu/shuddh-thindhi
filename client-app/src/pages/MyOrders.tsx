import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Storefront/Header";
import { Footer } from "@/components/Storefront/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useCartStore } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { useOrderUpdates } from "@/hooks/useOrderUpdates";
import { format } from "date-fns";
import { Package, Clock, Truck, CheckCircle, XCircle, Eye, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OrderStatusTracker } from "@/components/OrderStatusTracker";
import { getImageUrl } from "@/lib/utils/image";
import { queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import type { Order, CartItem } from "@shared/schema";

export default function MyOrders() {
  const { items } = useCartStore();
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Setup order updates (polling + cross-tab communication)
  useOrderUpdates(!!user);

  const { data: orders = [], isLoading, isFetching, dataUpdatedAt, refetch } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
    refetchInterval: 10000, // Refetch every 10 seconds for more responsive updates
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch when component mounts
    staleTime: 0, // Consider data stale immediately
  });

  const getStatusIcon = (status: string) => {
    if (!status) return <Clock className="h-4 w-4" />;
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const handleSubscribe = async (email: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/subscribers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to subscribe");
    }
  };

  const parseOrderItems = (itemsString: string): CartItem[] => {
    try {
      return JSON.parse(itemsString);
    } catch {
      return [];
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Header cartItemCount={items.reduce((sum, item) => sum + item.quantity, 0)} />

        <main className="flex-1 py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {isFetching && !isLoading && (
              <div className="fixed top-4 right-4 z-50 bg-primary text-primary-foreground px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm">Updating orders...</span>
              </div>
            )}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">
                    My Orders
                  </h1>
                  <p className="text-muted-foreground">
                    Track your orders and view order history
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-muted-foreground">Live</span>
                    </div>
                    {dataUpdatedAt && (
                      <p className="text-sm text-muted-foreground">
                        Last updated: {format(new Date(dataUpdatedAt), "HH:mm:ss")}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                    {isFetching ? 'Updating...' : 'Refresh'}
                  </Button>
                </div>
              </div>
            </div>

            {!isLoading && orders.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {orders.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Orders</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">
                    {orders.filter(o => o.status === 'pending').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {orders.filter(o => o.status === 'processing' || o.status === 'shipped').length}
                  </div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {orders.filter(o => o.status === 'delivered').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Delivered</div>
                </Card>
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="font-serif text-2xl font-semibold mb-2">
                  No orders yet
                </h2>
                <p className="text-muted-foreground mb-6">
                  Start shopping to see your orders here!
                </p>
                <Button asChild>
                  <a href="/products">Browse Products</a>
                </Button>
              </Card>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const orderItems = parseOrderItems(order.items);
                  return (
                    <Card key={order.id} className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            Order #{order.id ? order.id.slice(-8).toUpperCase() : 'N/A'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Placed on {format(new Date(order.createdAt), "PPP")}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 mt-3 md:mt-0">
                          <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                            {getStatusIcon(order.status)}
                            {getStatusText(order.status)}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium mb-2">Items ({orderItems.length})</h4>
                          <div className="space-y-2">
                            {orderItems.slice(0, 2).map((item, index) => (
                              <div key={index} className="flex items-center gap-3">
                                <img
                                  src={getImageUrl(item.image)}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded-lg bg-muted"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{item.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Qty: {item.quantity} × ₹{item.price}
                                  </p>
                                </div>
                              </div>
                            ))}
                            {orderItems.length > 2 && (
                              <p className="text-sm text-muted-foreground">
                                +{orderItems.length - 2} more items
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Order Summary</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Total Amount:</span>
                              <span className="font-mono font-semibold">
                                ₹{order.totalAmount.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Shipping:</span>
                              <span className="text-chart-3">FREE</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border">
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Delivery Address:</span>
                            <p className="text-muted-foreground mt-1">
                              {order.shippingAddress}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Contact:</span>
                            <p className="text-muted-foreground mt-1">
                              {order.customerPhone}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* Order Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Order Details #{selectedOrder?.id ? selectedOrder.id.slice(-8).toUpperCase() : 'N/A'}
              </DialogTitle>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Placed on {format(new Date(selectedOrder.createdAt), "PPP 'at' p")}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(selectedOrder.status)} flex items-center gap-1`}>
                    {getStatusIcon(selectedOrder.status)}
                    {getStatusText(selectedOrder.status)}
                  </Badge>
                </div>

                <OrderStatusTracker 
                  status={selectedOrder.status} 
                  createdAt={selectedOrder.createdAt} 
                />

                <div>
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {parseOrderItems(selectedOrder.items).map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg bg-muted"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            ₹{item.price} × {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-semibold">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Shipping Address</h3>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="font-medium">{selectedOrder.customerName}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedOrder.shippingAddress}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Phone: {selectedOrder.customerPhone}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Order Summary</h3>
                    <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span className="font-mono">₹{selectedOrder.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Shipping:</span>
                        <span className="text-chart-3 font-medium">FREE</span>
                      </div>
                      <div className="border-t border-border pt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span className="font-mono">₹{selectedOrder.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Footer onSubscribe={handleSubscribe} />
      </div>
    </ProtectedRoute>
  );
}