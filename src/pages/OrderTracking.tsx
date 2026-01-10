import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, ChefHat, AlertCircle, PackageCheck, Home, Users, Star, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import BackButton from '../components/ui/BackButton';
import OrderStatusBadge from '../components/OrderStatusBadge';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import ReviewForm from '../components/ReviewForm';
import Card, { CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import NotificationPrompt from '../components/NotificationPrompt';
import { useRestaurant } from '../context/RestaurantContext';
import { useUser } from '../context/UserContext';
import { useNotifications } from '../hooks/useNotifications';
import { ordersApi } from '../api';
import reviewsApi from '../api/reviews.api';
import { Order, OrderStatus } from '../types';

const OrderTracking: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { restaurant } = useRestaurant();
  const { isAuthenticated } = useUser();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);
  const [reviewingItemIndex, setReviewingItemIndex] = useState<number | null>(null);

  // Ref to prevent duplicate API calls
  const hasFetchedOrder = useRef(false);
  const previousOrderId = useRef(orderId);

  const primaryColor = restaurant?.branding?.primaryColor || '#6366f1';
  const secondaryColor = restaurant?.branding?.secondaryColor || '#8b5cf6';

  // Fetch order data
  const fetchOrder = useCallback(async (showLoading = true) => {
    // Check if orderId changed - if so, reset the guard
    if (orderId !== previousOrderId.current) {
      hasFetchedOrder.current = false;
      previousOrderId.current = orderId;
    }

    // Prevent duplicate calls
    if (hasFetchedOrder.current || !orderId) return;
    hasFetchedOrder.current = true;

    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      const response = await ordersApi.getById(orderId);

      if (response.success) {
        setOrder(response.data);
      } else {
        setError('Order not found');
      }
    } catch (err: any) {
      console.error('Error fetching order:', err);
      setError(err.response?.data?.message || 'Failed to load order');
      hasFetchedOrder.current = false; // Reset on error to allow retry
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [orderId]);

  // Handle order update from FCM notification
  const handleOrderUpdateFromNotification = useCallback((notificationOrderId: string) => {
    console.log('📡 FCM notification: Refreshing order', notificationOrderId);

    if (notificationOrderId === orderId) {
      // Reset guard to allow refetch
      hasFetchedOrder.current = false;
      // Fetch order without showing loading spinner
      fetchOrder(false);
    }
  }, [orderId, fetchOrder]);

  // Setup Firebase Cloud Messaging notifications
  const { requestPermission, permissionStatus } = useNotifications(isAuthenticated, {
    onOrderUpdate: handleOrderUpdateFromNotification,
  });

  const isNotificationsEnabled = permissionStatus === 'granted';
  const isNotificationsBlocked = permissionStatus === 'denied';

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleRetry = () => {
    hasFetchedOrder.current = false;
    fetchOrder();
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!orderId || reviewingItemIndex === null || !order) return;

    try {
      const menuItem = order.items[reviewingItemIndex];
      const response = await reviewsApi.create({
        menuItemId: menuItem.menuItemId._id,
        rating,
        comment,
      });

      if (response.success) {
        toast.success('Thank you for your review!');
        setHasSubmittedReview(true);
        setShowReviewForm(false);
        setReviewingItemIndex(null);
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleLeaveReview = (itemIndex: number) => {
    setReviewingItemIndex(itemIndex);
    setShowReviewForm(true);
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
      case 'received':
        return <Clock className="h-6 w-6" />;
      case 'confirmed':
        return <CheckCircle className="h-6 w-6" />;
      case 'preparing':
        return <ChefHat className="h-6 w-6" />;
      case 'ready':
        return <PackageCheck className="h-6 w-6" />;
      case 'served':
      case 'completed':
        return <CheckCircle className="h-6 w-6" />;
      case 'cancelled':
        return <AlertCircle className="h-6 w-6" />;
      default:
        return <Clock className="h-6 w-6" />;
    }
  };

  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case 'pending':
      case 'received':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'served':
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusMessage = (status: OrderStatus): string => {
    switch (status) {
      case 'pending':
      case 'received':
        return 'Your order has been received and is being processed';
      case 'confirmed':
        return 'Your order has been confirmed by the restaurant';
      case 'preparing':
        return 'Your order is being prepared in the kitchen';
      case 'ready':
        return 'Your order is ready for pickup or serving';
      case 'served':
      case 'completed':
        return 'Your order has been completed. Enjoy your meal!';
      case 'cancelled':
        return 'Your order has been cancelled';
      default:
        return 'Processing your order';
    }
  };

  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <Loading message="Loading your order..." />;
  }

  if (error || !order) {
    return (
      <ErrorMessage
        title="Order Not Found"
        message={error || 'Unable to load order details'}
        onRetry={handleRetry}
      />
    );
  }

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Order History', path: '/order-history' },
    { label: `Order #${order.orderNumber}`, path: `/order/${orderId}` },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SEO
        title={`Order #${order.orderNumber}`}
        description="Track your order status and view order details"
        keywords={['order tracking', 'order status', 'food delivery']}
      />
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />

        {/* Back Button */}
        <div className="mb-6">
          <BackButton to="/order-history" label="Back to Order History" />
        </div>

        {/* Notification Status Card */}
        <div className="mb-6">
          {isNotificationsEnabled ? (
            // Notifications Enabled
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardBody className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      Live Updates Enabled
                    </span>
                  </div>
                  <Badge variant="success" size="sm">
                    Real-time
                  </Badge>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  You'll receive notifications when your order status changes
                </p>
              </CardBody>
            </Card>
          ) : isNotificationsBlocked ? (
            // Notifications Blocked
            <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
              <CardBody className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium text-red-900">
                      Notifications Blocked
                    </span>
                  </div>
                  <Badge variant="danger" size="sm">
                    Disabled
                  </Badge>
                </div>
                <p className="text-xs text-red-700 mt-1">
                  Please enable notifications in your browser settings to receive real-time order status updates
                </p>
              </CardBody>
            </Card>
          ) : (
            // Notifications Disabled (Default)
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardBody className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Bell className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-900">
                        Enable Real-Time Order Updates
                      </span>
                    </div>
                    <p className="text-xs text-blue-700">
                      Get instant notifications when your order status changes - from preparing to ready for pickup!
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={requestPermission}
                    className="ml-4 bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                  >
                    <Bell className="h-4 w-4 mr-1" />
                    Enable
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Order Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Order #{order.orderNumber}
              </h2>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {formatDate(order.createdAt)}
            </p>
          </CardHeader>

          <CardBody>
            {/* Current Status */}
            <div
              className={`p-6 rounded-xl border-2 mb-6 ${getStatusColor(order.status)}`}
            >
              <div className="flex items-center space-x-4">
                <div
                  className="p-4 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}20 0%, ${secondaryColor}20 100%)`,
                  }}
                >
                  {getStatusIcon(order.status)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold capitalize">{order.status}</h3>
                  <p className="text-sm mt-1">{getStatusMessage(order.status)}</p>
                </div>
              </div>
            </div>

            {/* Table Information */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
              <div className="flex items-center space-x-3">
                <Home className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Table</p>
                  <p className="font-semibold text-gray-900">
                    {order.tableId?.tableNumber || 'N/A'}
                  </p>
                </div>
              </div>
              {order.tableId?.location && (
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold text-gray-900">{order.tableId.location}</p>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200"
                  >
                    {item.menuItemId?.image && (
                      <img
                        src={item.menuItemId.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </p>
                          {item.specialInstructions && (
                            <p className="text-sm text-gray-500 italic mt-1">
                              Note: {item.specialInstructions}
                            </p>
                          )}
                        </div>
                        <p className="font-semibold text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>

                      {/* Review Button for Completed Orders */}
                      {(order.status === 'served' || order.status === 'completed') &&
                        !hasSubmittedReview && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLeaveReview(index)}
                            className="mt-3"
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Leave a Review
                          </Button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-1">Order Notes</h4>
                <p className="text-sm text-yellow-800">{order.notes}</p>
              </div>
            )}
          </CardBody>

          <CardFooter>
            {/* Price Summary */}
            <div className="space-y-2 w-full">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span className="font-semibold">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Tax</span>
                <span className="font-semibold">{formatPrice(order.tax)}</span>
              </div>
              <div className="border-t border-gray-300 pt-2 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span
                  className="text-2xl font-bold"
                  style={{ color: primaryColor }}
                >
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            fullWidth
            onClick={() => navigate('/menu')}
          >
            Order Again
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate('/order-history')}
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            View Order History
          </Button>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewForm && reviewingItemIndex !== null && (
        <ReviewForm
          isOpen={showReviewForm}
          onClose={() => {
            setShowReviewForm(false);
            setReviewingItemIndex(null);
          }}
          onSubmit={handleReviewSubmit}
          itemName={order.items[reviewingItemIndex]?.name || ''}
        />
      )}

      {/* Notification Permission Prompt */}
      {isAuthenticated && (
        <NotificationPrompt
          onRequestPermission={requestPermission}
          onDismiss={() => console.log('Notification prompt dismissed')}
        />
      )}
    </div>
  );
};

export default OrderTracking;
