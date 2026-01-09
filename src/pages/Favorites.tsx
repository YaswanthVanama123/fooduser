import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Heart, ShoppingBag, Trash2, Search } from 'lucide-react';
import Card, { CardBody, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import BackButton from '../components/ui/BackButton';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useRestaurant } from '../context/RestaurantContext';
import favoritesApi from '../api/favorites.api';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  images?: {
    original?: string;
    large?: string;
    medium?: string;
    small?: string;
  };
  categoryId: {
    _id: string;
    name: string;
  };
  isAvailable: boolean;
  preparationTime?: number;
}

const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();
  const { addItem } = useCart();
  const { restaurant } = useRestaurant();

  const [favorites, setFavorites] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const primaryColor = restaurant?.branding?.primaryColor || '#6366f1';
  const secondaryColor = restaurant?.branding?.secondaryColor || '#8b5cf6';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/favorites');
      return;
    }
    fetchFavorites();
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      const response = await favoritesApi.getFavorites();

      if (response.success) {
        // Backend returns menu items directly in data array
        setFavorites(response.data || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (itemId: string) => {
    try {
      setRemovingId(itemId);
      const response = await favoritesApi.removeFavorite(itemId);

      if (response.success) {
        setFavorites(favorites.filter((item) => item._id !== itemId));
        toast.success('Removed from favorites');
      }
    } catch (error: any) {
      console.error('Failed to remove favorite:', error);
      toast.error('Failed to remove from favorites');
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      menuItem: item,
      quantity: 1,
    });
    toast.success(
      <div className="flex items-center space-x-2">
        <ShoppingBag className="h-5 w-5" />
        <span>{item.name} added to cart!</span>
      </div>,
      {
        style: {
          background: primaryColor,
          color: '#fff',
        },
      }
    );
  };

  const filteredFavorites = favorites.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get image URL handling both old and new formats
  const getImageUrl = (item: MenuItem): string | null => {
    const imagePath = item.images?.original || item.image;
    if (!imagePath) return null;

    // If already a full URL, use as-is
    if (imagePath.startsWith('http')) return imagePath;

    // Otherwise, prepend backend URL
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${baseUrl}${imagePath}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
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
            <Heart className="h-10 w-10 text-white" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
          <p className="text-gray-600 mt-2">
            Quick access to your favorite menu items
          </p>
        </div>

        {/* Search */}
        {favorites.length > 0 && (
          <Card className="mb-6">
            <CardBody>
              <Input
                type="text"
                placeholder="Search favorites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-5 w-5" />}
              />
            </CardBody>
          </Card>
        )}

        {/* Favorites Grid */}
        {filteredFavorites.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No Matching Favorites' : 'No Favorites Yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? 'Try a different search term'
                  : "Start adding items to your favorites for quick access"}
              </p>
              {!searchTerm && (
                <Button
                  variant="primary"
                  onClick={() => navigate('/menu')}
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  }}
                >
                  Browse Menu
                </Button>
              )}
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((item) => {
              const imageUrl = getImageUrl(item);
              return (
                <Card key={item._id} className="hover:shadow-xl transition-shadow">
                  {imageUrl && (
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      {!item.isAvailable && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <Badge variant="danger">Unavailable</Badge>
                        </div>
                      )}
                      <button
                        onClick={() => handleRemoveFavorite(item._id)}
                        disabled={removingId === item._id}
                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                        title="Remove from favorites"
                      >
                        {removingId === item._id ? (
                          <div className="animate-spin h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full"></div>
                        ) : (
                          <Heart
                            className="h-5 w-5 text-red-500"
                            fill="currentColor"
                          />
                        )}
                      </button>
                    </div>
                  )}

                  <CardBody>
                    <div className="mb-2">
                      <Badge variant="info">{item.categoryId?.name || 'Uncategorized'}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-gray-900">
                        ${item.price.toFixed(2)}
                      </span>
                      {item.preparationTime && (
                        <span className="text-sm text-gray-500">
                          ~{item.preparationTime} min
                        </span>
                      )}
                    </div>
                  </CardBody>

                  <CardFooter>
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        onClick={() => handleRemoveFavorite(item._id)}
                        disabled={removingId === item._id}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => handleAddToCart(item)}
                        disabled={!item.isAvailable}
                        style={{
                          background: item.isAvailable
                            ? `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
                            : undefined,
                        }}
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
