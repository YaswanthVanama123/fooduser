import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, ChefHat, AlertCircle, PackageCheck, Home, Wifi, WifiOff, Users, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import OrderStatusBadge from '../components/OrderStatusBadge';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import ReviewForm from '../components/ReviewForm';
import Card, { CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useSocket } from '../context/SocketContext';
import { useRestaurant } from '../context/RestaurantContext';
import { ordersApi } from '../api';
import reviewsApi from '../api/reviews.api';
import { Order, OrderStatus } from '../types';
import socketService from '../services/socket';

const OrderTracking: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { restaurant } = useRestaurant();
  const { socket, isConnected } = useSocket();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);
  const [reviewingItemIndex, setReviewingItemIndex] = useState<number | null>(null);

  const primaryColor = restaurant?.branding?.primaryColor || '#6366f1';
  const secondaryColor = restaurant?.branding?.secondaryColor || '#8b5cf6';

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  useEffect(() => {
    if (socket && orderId) {
      // Track this specific order for real-time updates
      socketService.trackOrder(orderId);

      // Listen for order status updates
      const handleOrderUpdate = (data: any) => {
        console.log('Order status updated:', data);
        if (data.order) {
          setOrder(data.order);
        }
      };

      const handleOrderStatusUpdate = (data: any) => {
        console.log('Order status changed:', data);
        if (data.status) {
          setOrder((prev) => (prev ? { ...prev, status: data.status } : null));
        }
      };

      socket.on('order-status-updated', handleOrderStatusUpdate);
      socket.on('order-updated', handleOrderUpdate);

      return () => {
        socket.off('order-status-updated', handleOrderStatusUpdate);
        socket.off('order-updated', handleOrderUpdate);
        socketService.stopTrackingOrder(orderId);
      };
    }
  }, [socket, orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ordersApi.getById(orderId!);

      if (response.success) {
        setOrder(response.data);
      } else {
        setError('Order not found');
      }
    } catch (err: any) {
      console.error('Error fetching order:', err);
      setError(err.response?.data?.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTimeline = (currentStatus: OrderStatus) => {
    const statuses: OrderStatus[] = ['received', 'preparing', 'ready', 'served'];
    const currentIndex = statuses.indexOf(currentStatus);

    return statuses.map((status, index) => ({
      status,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return Clock;
      case 'preparing':
        return ChefHat;
      case 'ready':
        return PackageCheck;
      case 'served':
        return CheckCircle;
      case 'cancelled':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const getStatusMessage = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return 'Your order has been received and will be prepared shortly.';
      case 'preparing':
        return 'Our chefs are preparing your delicious meal!';
      case 'ready':
        return 'Your order is ready! Please collect it from the counter or wait for service.';
      case 'served':
        return 'Enjoy your meal! We hope you love it.';
      case 'cancelled':
        return 'This order has been cancelled. Please contact staff for assistance.';
      default:
        return 'Tracking your order...';
    }
  };

  const getStatusTitle = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return 'Order Received';
      case 'preparing':
        return 'Being Prepared';
      case 'ready':
        return 'Ready to Serve';
      case 'served':
        return 'Order Served';
      case 'cancelled':
        return 'Order Cancelled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleReviewSubmit = async (data: { rating: number; comment: string }) => {
    try {
      if (reviewingItemIndex === null || !order) {
        throw new Error('No item selected for review');
      }

      const item = order.items[reviewingItemIndex];
      const menuItemId = typeof item.menuItemId === 'object' ? item.menuItemId._id : item.menuItemId;

      await reviewsApi.createReview({
        menuItemId,
        orderId: orderId!,
        rating: data.rating,
        comment: data.comment,
      });

      setHasSubmittedReview(true);
      setShowReviewForm(false);
      setReviewingItemIndex(null);

      toast.success('Thank you for your review!', {
        style: {
          background: primaryColor,
          color: '#fff',
        },
      });
    } catch (err: any) {
      console.error('Error submitting review:', err);
      toast.error(err.response?.data?.message || 'Failed to submit review');
      throw err;
    }
  };

  if (loading) {
    return <Loading message="Loading order..." />;
  }

  if (error || !order) {
    return (
      <ErrorMessage
        title="Order Not Found"
        message={error || 'Unable to find this order'}
        onRetry={() => navigate('/menu')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SEO
        title="Order Tracking"
        description={`Track your order #${order.orderNumber} in real-time`}
      />
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'Home', path: '/' },
              { label: 'Menu', path: '/menu' },
              { label: 'Order Tracking', path: `/order/${orderId}` },
            ]}
          />
        </div>

        {/* Order Header Card */}
        <Card className="mb-8 overflow-hidden">
          <div
            className="h-2"
            style={{
              background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          />
          <CardBody className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Order #{order.orderNumber}
                </h1>
                <div className="flex items-center space-x-3 text-gray-600">
                  <span className="flex items-center">
                    <Home className="h-4 w-4 mr-1" />
                    Table {order.tableNumber}
                  </span>
                  <span>•</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            {/* Connection Status */}
            <div
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${
                isConnected
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4" />
                  <span>Live updates active</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4" />
                  <span>Connecting...</span>
                </>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Status Timeline (if not cancelled) */}
        {order.status !== 'cancelled' && (
          <Card className="mb-8">
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-900">Order Progress</h2>
              <p className="text-gray-600 text-sm mt-1">{getStatusMessage(order.status)}</p>
            </CardHeader>

            <CardBody className="p-6">
              <div className="relative">
                {/* Timeline Steps */}
                <div className="space-y-6">
                  {getStatusTimeline(order.status).map((item, index, array) => {
                    const StatusIcon = getStatusIcon(item.status);
                    const isLast = index === array.length - 1;

                    return (
                      <div key={item.status} className="relative flex items-start group">
                        {/* Connecting Line */}
                        {!isLast && (
                          <div
                            className={`absolute left-10 top-20 bottom-0 w-1 transition-all duration-500 ${
                              item.completed ? 'bg-gradient-to-b' : 'bg-gray-200'
                            }`}
                            style={{
                              backgroundImage: item.completed
                                ? `linear-gradient(to bottom, ${primaryColor}, ${secondaryColor})`
                                : undefined,
                            }}
                          />
                        )}

                        {/* Icon Circle */}
                        <div className="relative z-10 flex-shrink-0">
                          <div
                            className={`flex items-center justify-center w-20 h-20 rounded-2xl shadow-lg transition-all duration-500 ${
                              item.active ? 'scale-110 animate-pulse' : ''
                            }`}
                            style={{
                              background: item.completed
                                ? `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
                                : '#E5E7EB',
                            }}
                          >
                            <StatusIcon
                              className={`h-10 w-10 ${
                                item.completed ? 'text-white' : 'text-gray-400'
                              }`}
                            />
                          </div>

                          {/* Active pulse ring */}
                          {item.active && (
                            <div
                              className="absolute inset-0 rounded-2xl animate-ping opacity-75"
                              style={{
                                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                              }}
                            />
                          )}
                        </div>

                        {/* Status Info */}
                        <div className="ml-6 flex-1 pb-8">
                          <div
                            className={`p-4 rounded-xl transition-all ${
                              item.active
                                ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 shadow-md'
                                : item.completed
                                ? 'bg-gray-50'
                                : 'bg-white border border-gray-200'
                            }`}
                          >
                            <h3
                              className={`font-bold text-xl mb-1 ${
                                item.completed ? 'text-gray-900' : 'text-gray-400'
                              }`}
                            >
                              {getStatusTitle(item.status)}
                            </h3>
                            {item.active && (
                              <p className="text-gray-700 text-sm leading-relaxed">
                                {getStatusMessage(order.status)}
                              </p>
                            )}
                            {item.completed && !item.active && (
                              <div className="flex items-center text-green-600 text-sm mt-1">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                <span>Completed</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Status Message for Cancelled */}
        {order.status === 'cancelled' && (
          <Card className="mb-8 bg-red-50 border-2 border-red-200">
            <CardBody className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-red-900 mb-2">Order Cancelled</h3>
                  <p className="text-red-800">{getStatusMessage('cancelled')}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Order Details */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
          </CardHeader>

          <CardBody className="p-6">
            {/* Items */}
            <div className="space-y-4 mb-6">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge variant="primary" size="lg">
                        {item.quantity}x
                      </Badge>
                      <h4 className="font-bold text-lg text-gray-900">{item.name}</h4>
                    </div>

                    {/* Customizations */}
                    {item.customizations && item.customizations.length > 0 && (
                      <div className="ml-12 space-y-1 mb-2">
                        {item.customizations.map((custom, i) => (
                          <div key={i} className="flex items-start text-sm">
                            <Badge variant="secondary" size="sm" className="mr-2">
                              {custom.name}
                            </Badge>
                            <span className="text-gray-600">{custom.options.join(', ')}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Special Instructions */}
                    {item.specialInstructions && (
                      <p className="ml-12 text-sm text-gray-600 italic bg-yellow-50 border-l-4 border-yellow-400 pl-3 py-1">
                        Note: {item.specialInstructions}
                      </p>
                    )}
                  </div>

                  <span className="font-bold text-xl text-gray-900 ml-4">
                    ${item.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Summary */}
            <div className="border-t-2 border-gray-200 pt-4">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-700 text-lg">
                  <span>Subtotal</span>
                  <span className="font-semibold">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700 text-lg">
                  <span>Tax</span>
                  <span className="font-semibold">${order.tax.toFixed(2)}</span>
                </div>
              </div>

              <div
                className="flex justify-between items-center p-4 rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}15 100%)`,
                }}
              >
                <span className="text-xl font-bold text-gray-900">Total</span>
                <span className="text-3xl font-bold" style={{ color: primaryColor }}>
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">Order Notes</p>
                <p className="text-blue-800">{order.notes}</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Rate Your Experience Section - Only show when order is served */}
        {order.status === 'served' && !hasSubmittedReview && (
          <Card className="mb-8">
            <div
              className="h-2"
              style={{
                background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}
            />
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  }}
                >
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Rate Your Experience</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    How was your meal? We'd love to hear your feedback!
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardBody className="p-6">
              {!showReviewForm ? (
                <div className="space-y-4">
                  <p className="text-gray-700 mb-4 text-center">
                    Your feedback helps us serve you better. Rate the items you ordered!
                  </p>
                  <div className="grid gap-3">
                    {order.items.map((item, index) => {
                      const menuItem = typeof item.menuItemId === 'object' ? item.menuItemId : null;
                      const itemName = menuItem?.name || item.name;
                      const itemImage = menuItem?.image;

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            {itemImage && (
                              <img
                                src={itemImage}
                                alt={itemName}
                                className="w-12 h-12 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{itemName}</p>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setReviewingItemIndex(index);
                              setShowReviewForm(true);
                            }}
                            style={{
                              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                            }}
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Rate Item
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <ReviewForm
                  menuItemId={reviewingItemIndex !== null && order.items[reviewingItemIndex]
                    ? (typeof order.items[reviewingItemIndex].menuItemId === 'object'
                      ? order.items[reviewingItemIndex].menuItemId._id
                      : order.items[reviewingItemIndex].menuItemId)
                    : ''}
                  menuItemName={reviewingItemIndex !== null && order.items[reviewingItemIndex]
                    ? (typeof order.items[reviewingItemIndex].menuItemId === 'object'
                      ? order.items[reviewingItemIndex].menuItemId.name
                      : order.items[reviewingItemIndex].name)
                    : 'Item'}
                  onSubmit={handleReviewSubmit}
                  onCancel={() => {
                    setShowReviewForm(false);
                    setReviewingItemIndex(null);
                  }}
                />
              )}
            </CardBody>
          </Card>
        )}

        {/* Thank You Message - Show after review is submitted */}
        {order.status === 'served' && hasSubmittedReview && (
          <Card className="mb-8 bg-green-50 border-2 border-green-200">
            <CardBody className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    }}
                  >
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-green-900 mb-1">
                    Thank You for Your Feedback!
                  </h3>
                  <p className="text-green-800">
                    We appreciate you taking the time to share your experience. Your feedback helps
                    us improve our service!
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button variant="outline" size="lg" onClick={() => navigate('/menu')} fullWidth>
            <PackageCheck className="h-5 w-5 mr-2" />
            Order More Items
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/')}
            fullWidth
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            <Home className="h-5 w-5 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Help Section */}
        <Card className="mt-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <CardBody className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500 flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Need Assistance?</h3>
            <p className="text-gray-700 max-w-md mx-auto">
              Our friendly staff is always here to help. Feel free to call us over if you need
              anything!
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default OrderTracking;
