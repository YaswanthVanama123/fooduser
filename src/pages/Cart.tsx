import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Package, CreditCard, FileText, Lock, Lightbulb } from 'lucide-react';
import Header from '../components/Header';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Card, { CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import TextArea from '../components/ui/TextArea';
import Badge from '../components/ui/Badge';
import SimpleAuthModal from '../components/SimpleAuthModal';
import { useCart } from '../context/CartContext';
import { useRestaurant } from '../context/RestaurantContext';
import { useUser } from '../context/UserContext';
import { ordersApi } from '../api';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { cart, tableId, tableNumber, updateQuantity, removeFromCart, clearCart, getCartTotal } =
    useCart();
  const { restaurant } = useRestaurant();
  const { isAuthenticated, user, login, register } = useUser();
  const [orderNotes, setOrderNotes] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { subtotal, tax, total } = getCartTotal();
  const primaryColor = restaurant?.branding?.primaryColor || '#6366f1';
  const secondaryColor = restaurant?.branding?.secondaryColor || '#8b5cf6';

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!tableId) {
      toast.error('Please select a table first');
      navigate('/');
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error('Please login to place your order', {
        icon: '🔒',
        duration: 3000,
      });
      setShowAuthModal(true);
      return;
    }

    try {
      setIsPlacingOrder(true);

      // Prepare order data
      const orderData = {
        tableId,
        items: cart.map((item) => ({
          menuItemId: item.menuItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          customizations: item.customizations || [],
          subtotal: item.subtotal,
          specialInstructions: item.specialInstructions,
        })),
        notes: orderNotes || undefined,
      };

      console.log('Placing order for user:', user?.username);
      const response = await ordersApi.create(orderData);

      if (response.success) {
        const order = response.data;
        toast.success(
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Order placed successfully!</span>
          </div>,
          {
            duration: 4000,
            style: {
              background: primaryColor,
              color: '#fff',
            },
          }
        );
        clearCart();
        navigate(`/order/${order._id}`);
      } else {
        toast.error(response.message || 'Failed to place order');
      }
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <SEO
          title="Cart"
          description="Review your cart and place your order. Add delicious items from our menu and complete your order with ease."
          keywords={['cart', 'checkout', 'order', 'food ordering']}
        />
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumbs className="mb-6" />
          <div className="flex flex-col items-center justify-center py-12">
            <Card className="max-w-md w-full">
              <CardBody className="text-center py-12">
                <div
                  className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  }}
                >
                  <ShoppingCart className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-600 mb-6">
                  Add some delicious items from our menu to get started!
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/menu')}
                  fullWidth
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  }}
                >
                  <Package className="h-5 w-5 mr-2" />
                  Browse Menu
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SEO
        title="Cart"
        description="Review your cart and place your order. Add delicious items from our menu and complete your order with ease."
        keywords={['cart', 'checkout', 'order', 'food ordering']}
      />
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs className="mb-6" />

        {/* Back Button */}
        <button
          onClick={() => navigate('/menu')}
          className="flex items-center text-gray-700 hover:text-gray-900 mb-6 transition-colors group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Continue Shopping</span>
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            Review your items and complete your order
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Items Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Your Items ({cart.length})
                  </h2>
                  {cart.length > 0 && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to clear your cart?')) {
                          clearCart();
                          toast.success('Cart cleared');
                        }
                      }}
                      className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </CardHeader>

              <CardBody className="divide-y divide-gray-200">
                {cart.map((item, index) => (
                  <div key={`${item.menuItemId}-${index}`} className="py-6 first:pt-0 last:pb-0">
                    <div className="flex items-start space-x-4">
                      {/* Item Image */}
                      {item.image && (
                        <div className="flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-24 h-24 rounded-lg object-cover shadow-md"
                          />
                        </div>
                      )}

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{item.name}</h3>

                        {/* Customizations */}
                        {item.customizations && item.customizations.length > 0 && (
                          <div className="space-y-1 mb-2">
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
                          <div className="flex items-start text-sm mb-2">
                            <FileText className="h-4 w-4 mr-1 text-gray-500 flex-shrink-0 mt-0.5" />
                            <p className="text-gray-600 italic">
                              {item.specialInstructions}
                            </p>
                          </div>
                        )}

                        {/* Price per item */}
                        <p className="text-sm text-gray-600">
                          ${item.price.toFixed(2)} each
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3 mt-3">
                          <button
                            onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105"
                            style={{
                              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                            }}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-bold text-lg w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                            style={{
                              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Price and Remove */}
                      <div className="flex flex-col items-end space-y-3">
                        <p className="font-bold text-xl" style={{ color: primaryColor }}>
                          ${item.subtotal.toFixed(2)}
                        </p>
                        <button
                          onClick={() => {
                            removeFromCart(item.menuItemId);
                            toast.success('Item removed from cart');
                          }}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <h3 className="font-bold text-lg text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Add a Note to Your Order
                </h3>
              </CardHeader>
              <CardBody>
                <TextArea
                  placeholder="Any special requests, dietary restrictions, or allergies we should know about?"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={4}
                  helperText="Optional: Share any additional instructions for the kitchen"
                />
              </CardBody>
            </Card>
          </div>

          {/* Order Summary - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Order Summary
                  </h3>
                </CardHeader>

                <CardBody className="space-y-4">
                  {/* Table Info */}
                  <div className="p-4 rounded-lg" style={{ backgroundColor: `${primaryColor}15` }}>
                    <p className="text-sm font-medium text-gray-700 mb-1">Table Number</p>
                    <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                      {tableNumber}
                    </p>
                  </div>

                  {/* Item Count */}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-700 font-medium">Items in Cart</span>
                    <Badge variant="primary" size="lg">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </Badge>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    {/* Price Breakdown */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal</span>
                        <span className="font-semibold">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Tax (8%)</span>
                        <span className="font-semibold">${tax.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-300 mt-4 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-3xl font-bold" style={{ color: primaryColor }}>
                          ${total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>

                <CardFooter>
                  {/* Authentication Notice - Show when not logged in */}
                  {!isAuthenticated && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 font-medium flex items-center">
                        <Lock className="h-4 w-4 mr-2" />
                        Please login to place your order
                      </p>
                    </div>
                  )}

                  {/* Logged in user info */}
                  {isAuthenticated && user && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 font-medium flex items-center">
                        <Package className="h-4 w-4 mr-2" />
                        Ordering as: {user.username}
                      </p>
                    </div>
                  )}

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handlePlaceOrder}
                    isLoading={isPlacingOrder}
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    }}
                  >
                    {isAuthenticated ? (
                      <>
                        <Package className="h-5 w-5 mr-2" />
                        {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5 mr-2" />
                        Login to Place Order
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-3 flex items-center justify-center">
                    <Lock className="h-3 w-3 mr-1" />
                    {isAuthenticated
                      ? 'Your order will be sent to the kitchen immediately'
                      : 'Login required to place orders'
                    }
                  </p>
                </CardFooter>
              </Card>

              {/* Help Card */}
              <Card className="mt-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100">
                <CardBody className="text-center py-6">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500 flex items-center justify-center">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Need Help?</h4>
                  <p className="text-sm text-gray-600">
                    Our staff is here to assist you with your order
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Auth Modal */}
      <SimpleAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={login}
        onRegister={register}
      />
    </div>
  );
};

export default Cart;
