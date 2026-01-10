import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Clock,
  ShoppingBag,
  ChevronRight,
  RefreshCw,
  Calendar,
  MapPin,
  DollarSign,
  Search,
  Filter,
} from 'lucide-react';
import Card, { CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import BackButton from '../components/ui/BackButton';
import ConfirmModal from '../components/ui/ConfirmModal';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { useUser } from '../context/UserContext';
import { useRestaurant } from '../context/RestaurantContext';
import { useCart } from '../context/CartContext';
import authApi from '../api/auth.api';
import { ordersApi } from '../api';
import { getImageUrl } from '../utils/imageUrl';

interface OrderItem {
  menuItemId: string | {
    _id: string;
    name: string;
    price: number;
    image?: string;
  };
  name: string;
  quantity: number;
  customizations?: Array<{
    name: string;
    options: string[];
    priceModifier: number;
  }>;
  specialInstructions?: string;
  price: number;
  subtotal: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  items: OrderItem[];
  total: number;
  tableNumber?: string;
  createdAt: string;
  updatedAt: string;
}

const OrderHistory: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();
  const { restaurant } = useRestaurant();
  const { addToCart, clearCart } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [orderToReorder, setOrderToReorder] = useState<string | null>(null);

  // Ref to prevent duplicate API calls (especially in React StrictMode)
  const hasFetchedOrders = useRef(false);
  const previousDeps = useRef({ page, statusFilter, isAuthenticated });

  const primaryColor = restaurant?.branding?.primaryColor || '#6366f1';
  const secondaryColor = restaurant?.branding?.secondaryColor || '#8b5cf6';

  const fetchOrders = useCallback(async () => {
    // Check if dependencies changed - reset guard if needed
    const currentDeps = { page, statusFilter, isAuthenticated };
    if (JSON.stringify(currentDeps) !== JSON.stringify(previousDeps.current)) {
      hasFetchedOrders.current = false;
      previousDeps.current = currentDeps;
    }

    // Prevent duplicate calls
    if (hasFetchedOrders.current || !isAuthenticated) return;
    hasFetchedOrders.current = true;

    try {
      setIsLoading(true);
      const response = await authApi.getOrderHistory({
        page,
        limit: 10,
        status: statusFilter || undefined,
      });

      if (response.success) {
        setOrders(response.data.orders || response.data);
        setHasMore(response.data.hasMore || false);
      }
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load order history');
      hasFetchedOrders.current = false; // Reset on error
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/order-history');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate, fetchOrders]);

  const handleReorder = async (orderId: string) => {
    setOrderToReorder(orderId);
    setShowReorderModal(true);
  };

  const handleReorderConfirm = async () => {
    if (!orderToReorder) return;

    try {
      setReorderingId(orderToReorder);
      setShowReorderModal(false);

      // Fetch the full order details to get all items
      const response = await ordersApi.getById(orderToReorder);

      if (!response.success || !response.data) {
        throw new Error('Failed to fetch order details');
      }

      const order = response.data;

      // Check if order has items
      if (!order.items || order.items.length === 0) {
        toast.error('This order has no items to reorder');
        return;
      }

      // Clear existing cart
      clearCart();

      // Add each item to cart
      let addedCount = 0;
      let skippedCount = 0;

      for (const item of order.items) {
        try {
          // Get menu item ID (handle both populated and unpopulated)
          const menuItemId = typeof item.menuItemId === 'object'
            ? item.menuItemId._id
            : item.menuItemId;

          // Get item details
          const itemName = typeof item.menuItemId === 'object'
            ? item.menuItemId.name
            : item.name;

          const itemImage = typeof item.menuItemId === 'object' && item.menuItemId.image
            ? item.menuItemId.image
            : undefined;

          // Create cart item
          const cartItem = {
            menuItemId,
            name: itemName,
            price: item.price,
            quantity: item.quantity,
            customizations: item.customizations || [],
            subtotal: item.subtotal || (item.price * item.quantity),
            specialInstructions: item.specialInstructions,
            image: itemImage,
          };

          addToCart(cartItem);
          addedCount++;
        } catch (error) {
          console.error('Failed to add item to cart:', error);
          skippedCount++;
        }
      }

      // Show success message
      if (addedCount > 0) {
        toast.success(
          `${addedCount} item(s) added to cart!${skippedCount > 0 ? ` (${skippedCount} unavailable)` : ''}`,
          {
            style: {
              background: primaryColor,
              color: '#fff',
            },
            duration: 3000,
          }
        );

        // Navigate to cart after a short delay
        setTimeout(() => {
          navigate('/cart');
        }, 500);
      } else {
        toast.error('No items could be added to cart');
      }
    } catch (error: any) {
      console.error('Reorder failed:', error);
      toast.error(error.response?.data?.message || 'Failed to reorder');
    } finally {
      setReorderingId(null);
      setOrderToReorder(null);
    }
  };

  const filteredOrders = orders.filter((order) =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton to="/menu" label="Back to Menu" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            <Clock className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
          <p className="text-gray-600 mt-2">View and reorder from your past orders</p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="Search by order number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-5 w-5" />}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Filter className="h-4 w-4 inline mr-1" />
                  Filter by Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="served">Served</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Orders Yet
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? 'No orders match your search'
                  : "You haven't placed any orders yet"}
              </p>
              <Button
                variant="primary"
                onClick={() => navigate('/menu')}
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                }}
              >
                Browse Menu
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order._id} className="hover:shadow-lg transition-shadow">
                <CardBody>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                        }}
                      >
                        <ShoppingBag className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 space-x-3 mt-1">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(order.createdAt)}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatTime(order.createdAt)}
                          </span>
                          {order.tableNumber && (
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              Table {order.tableNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Order Items ({order.items.length})
                    </h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => {
                        // Handle both populated and unpopulated menuItemId
                        const menuItem = typeof item.menuItemId === 'object' ? item.menuItemId : null;
                        const itemName = menuItem?.name || item.name || 'Unknown Item';
                        const itemImage = menuItem?.image;

                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center space-x-3">
                              {itemImage && (
                                <img
                                  src={getImageUrl(itemImage)}
                                  alt={itemName}
                                  className="w-10 h-10 rounded object-cover"
                                  onError={(e) => {
                                    // Fallback to placeholder if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/placeholder-food.jpg';
                                    target.onerror = null; // Prevent infinite loop
                                  }}
                                />
                              )}
                              <div>
                                <p className="font-medium text-gray-900">
                                  {item.quantity}x {itemName}
                                </p>
                                {item.specialInstructions && (
                                  <p className="text-xs text-gray-500">
                                    Note: {item.specialInstructions}
                                  </p>
                                )}
                              </div>
                            </div>
                            <p className="font-semibold text-gray-900">
                              ${(item.price || 0).toFixed(2)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Total and Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 pt-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-gray-600" />
                      <span className="text-sm text-gray-600">Total:</span>
                      <span className="text-xl font-bold text-gray-900">
                        ${(order.total || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/order/${order._id}`)}
                        className="w-full sm:w-auto"
                      >
                        <ChevronRight className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleReorder(order._id)}
                        isLoading={reorderingId === order._id}
                        className="w-full sm:w-auto"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                        }}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Reorder
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}

            {/* Pagination */}
            {hasMore && (
              <div className="text-center py-6">
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  isLoading={isLoading}
                >
                  Load More Orders
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reorder Confirmation Modal */}
      <ConfirmModal
        isOpen={showReorderModal}
        onClose={() => {
          setShowReorderModal(false);
          setOrderToReorder(null);
        }}
        onConfirm={handleReorderConfirm}
        title="Reorder Items"
        message="This will replace your current cart with items from this order. Continue?"
        confirmText="Yes, Reorder"
        cancelText="Cancel"
        variant="warning"
      />
    </div>
  );
};

export default OrderHistory;
