import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search, X, Plus, Minus, ShoppingBag, Clock, Filter, ChevronDown, Heart } from 'lucide-react';
import Header from '../components/Header';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import CategoryFilter from '../components/CategoryFilter';
import MenuItem from '../components/MenuItem';
import ErrorMessage from '../components/ErrorMessage';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Badge from '../components/ui/Badge';
import Card, { CardBody } from '../components/ui/Card';
import { MenuGridSkeleton } from '../components/ui/Skeleton';
import { useCart } from '../context/CartContext';
import { useRestaurant } from '../context/RestaurantContext';
import { useUser } from '../context/UserContext';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { menuApi } from '../api';
import favoritesApi from '../api/favorites.api';
import { MenuItem as MenuItemType, Category, CartItem, Customization } from '../types';

const Menu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { tableId, addToCart, cart, updateQuantity: updateCartQuantity, removeFromCart } = useCart();
  const { restaurant } = useRestaurant();
  const { isAuthenticated } = useUser();
  const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSearchHistory, setShowSearchHistory] = useState(false);

  // Get state from URL parameters
  const selectedCategory = searchParams.get('category');
  const searchQuery = searchParams.get('search') || '';
  const itemIdFromUrl = searchParams.get('item');

  // Favorites state
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // Dietary type filter state - Initialize from URL
  const [dietaryFilters, setDietaryFilters] = useState(() => ({
    vegetarian: searchParams.get('vegetarian') === 'true',
    vegan: searchParams.get('vegan') === 'true',
    glutenFree: searchParams.get('glutenFree') === 'true',
    nonVeg: searchParams.get('nonVeg') === 'true',
  }));
  const [showDietaryFilter, setShowDietaryFilter] = useState(false);

  // Item Modal State
  const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);
  const [customizations, setCustomizations] = useState<any>({});
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Ref to prevent duplicate API calls (especially in React StrictMode)
  const hasFetchedData = useRef(false);
  const isFetching = useRef(false);

  // Cache configuration
  const CACHE_KEY = 'menuPageData';
  const CACHE_DURATION = 10 * 1000; // 10 seconds (matches backend cache)

  // Memoized filter function
  const filterItems = useCallback(() => {
    let filtered = [...menuItems];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((item) => {
        // Handle both populated (object) and non-populated (string) categoryId
        const categoryId = typeof item.categoryId === 'object' && item.categoryId?._id
          ? item.categoryId._id
          : item.categoryId;
        return categoryId === selectedCategory;
      });
    }

    // Filter by dietary type
    const hasActiveFilters = Object.values(dietaryFilters).some(value => value);
    if (hasActiveFilters) {
      filtered = filtered.filter((item) => {
        // If any filter is active, item must match at least one active filter
        if (dietaryFilters.vegetarian && item.isVegetarian) return true;
        if (dietaryFilters.vegan && item.isVegan) return true;
        if (dietaryFilters.glutenFree && item.isGlutenFree) return true;
        if (dietaryFilters.nonVeg && item.isNonVeg) return true;
        return false;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }

    setFilteredItems(filtered);
  }, [menuItems, selectedCategory, searchQuery, dietaryFilters]);

  // Memoized fetch function with client-side caching
  const fetchData = useCallback(async (skipCache = false) => {
    // Prevent duplicate calls
    if (hasFetchedData.current || isFetching.current) return;

    try {
      isFetching.current = true;
      hasFetchedData.current = true;

      // Check localStorage cache (10s TTL for real-time menu updates)
      if (!skipCache) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const parsedCache = JSON.parse(cached);
            const cacheAge = Date.now() - parsedCache.timestamp;

            if (cacheAge < CACHE_DURATION) {
              console.log('[Menu] Using cached data (age:', Math.round(cacheAge / 1000), 's)');
              setCategories(parsedCache.data.categories || []);
              setMenuItems(parsedCache.data.menuItems || []);

              // Set favorites from cache if available
              if (parsedCache.data.favoriteIds) {
                setFavoriteIds(new Set(parsedCache.data.favoriteIds));
              }

              setLoading(false);
              isFetching.current = false;
              return;
            } else {
              // Stale cache - show it while revalidating
              console.log('[Menu] Cache stale, revalidating...');
              setCategories(parsedCache.data.categories || []);
              setMenuItems(parsedCache.data.menuItems || []);

              // Set favorites from stale cache
              if (parsedCache.data.favoriteIds) {
                setFavoriteIds(new Set(parsedCache.data.favoriteIds));
              }

              setLoading(false);
            }
          } catch (err) {
            localStorage.removeItem(CACHE_KEY);
          }
        }
      }

      setLoading(true);
      setError(null);

      // OPTIMIZED: Single API call returns categories, menu items, and favorites
      const response = await menuApi.getPageData(true); // true = available only

      if (response.success) {
        setCategories(response.data.categories || []);
        setMenuItems(response.data.menuItems || []);

        // Set favorites from the combined response (if user is authenticated)
        if (response.data.favoriteIds) {
          setFavoriteIds(new Set(response.data.favoriteIds));
        }

        // Cache the response
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: response.data,
          timestamp: Date.now(),
        }));
        console.log('[Menu] Data loaded and cached (favorites included)');
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load menu');
      hasFetchedData.current = false; // Reset on error to allow retry
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [CACHE_KEY, CACHE_DURATION]); // Stable deps

  // Toggle favorite status for an item (optimistic UI update)
  const handleToggleFavorite = async (itemId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to add favorites');
      navigate('/login?redirect=/menu');
      return;
    }

    const isFavorite = favoriteIds.has(itemId);

    try {
      if (isFavorite) {
        // Remove from favorites
        await favoritesApi.removeFavorite(itemId);
        setFavoriteIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
        toast.success('Removed from favorites', {
          icon: <Heart className="h-5 w-5 text-gray-400" />,
        });
      } else {
        // Add to favorites
        await favoritesApi.addFavorite(itemId);
        setFavoriteIds((prev) => new Set(prev).add(itemId));
        toast.success('Added to favorites', {
          icon: <Heart className="h-5 w-5 text-red-500 fill-current" />,
        });
      }
    } catch (error: any) {
      console.error('Failed to toggle favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  useEffect(() => {
    // Redirect to table selection if no table selected
    if (!tableId) {
      navigate('/');
      return;
    }

    fetchData();
  }, [tableId, navigate, fetchData]);

  // Remove separate favorites fetch - now included in page-data API
  // useEffect(() => {
  //   if (isAuthenticated && !hasFetchedFavorites.current) {
  //     fetchFavorites();
  //   }
  // }, [isAuthenticated, fetchFavorites]);

  useEffect(() => {
    filterItems();
  }, [filterItems]);

  // Effect to open modal from URL parameter
  useEffect(() => {
    if (itemIdFromUrl && menuItems.length > 0 && !selectedItem) {
      const item = menuItems.find((item) => item._id === itemIdFromUrl);
      if (item) {
        setSelectedItem(item);
        setCustomizations({});
        setQuantity(1);
        setSpecialInstructions('');
      }
    }
  }, [itemIdFromUrl, menuItems, selectedItem]);

  // Effect to sync dietary filters with URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    let hasChanges = false;

    // Update dietary filter params
    Object.entries(dietaryFilters).forEach(([key, value]) => {
      const currentValue = params.get(key) === 'true';
      if (value && !currentValue) {
        params.set(key, 'true');
        hasChanges = true;
      } else if (!value && currentValue) {
        params.delete(key);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setSearchParams(params, { replace: true });
    }
  }, [dietaryFilters]);

  useEffect(() => {
    // Close search history dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowSearchHistory(false);
      }
    };

    if (showSearchHistory) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchHistory]);

  // Get cart quantity for a specific menu item (without customizations)
  const getCartQuantity = (menuItemId: string): number => {
    const cartItem = cart.find(
      (item) => item.menuItemId === menuItemId &&
      (!item.customizations || item.customizations.length === 0)
    );
    return cartItem ? cartItem.quantity : 0;
  };

  // Handle quantity change from menu item
  const handleQuantityChange = (item: MenuItemType, newQuantity: number) => {
    const existingCartItem = cart.find(
      (cartItem) => cartItem.menuItemId === item._id &&
      (!cartItem.customizations || cartItem.customizations.length === 0)
    );

    if (newQuantity === 0) {
      // Remove from cart
      if (existingCartItem) {
        removeFromCart(existingCartItem.menuItemId);
        toast.success(`${item.name} removed from cart`);
      }
    } else if (existingCartItem) {
      // Update existing cart item quantity
      updateCartQuantity(existingCartItem.menuItemId, newQuantity);
    } else {
      // Add new item to cart
      const cartItem: CartItem = {
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        quantity: newQuantity,
        subtotal: item.price * newQuantity,
        image: item.images?.thumbnail || item.image,
        customizations: [],
        specialInstructions: '',
      };
      addToCart(cartItem);
      toast.success(
        <div className="flex items-center space-x-2">
          <ShoppingBag className="h-5 w-5" />
          <span>{item.name} added to cart!</span>
        </div>,
        {
          style: {
            background: restaurant?.branding?.primaryColor || '#6366f1',
            color: '#fff',
          },
        }
      );
    }
  };

  const handleItemClick = (item: MenuItemType) => {
    if (!item.isAvailable) {
      toast.error('This item is currently unavailable');
      return;
    }

    // Update URL with item ID
    const params = new URLSearchParams(searchParams);
    params.set('item', item._id);
    setSearchParams(params);

    setSelectedItem(item);
    setCustomizations({});
    setQuantity(1);
    setSpecialInstructions('');
  };

  const handleCloseModal = () => {
    // Remove item ID from URL
    const params = new URLSearchParams(searchParams);
    params.delete('item');
    setSearchParams(params);

    setSelectedItem(null);
    setCustomizations({});
    setQuantity(1);
    setSpecialInstructions('');
  };

  const handleQuickAdd = (item: MenuItemType, quantity: number) => {
    // This is called when "Update" button is clicked
    // The cart is already updated via handleQuantityChange
    // Just show a confirmation toast
    toast.success(
      <div className="flex items-center space-x-2">
        <ShoppingBag className="h-5 w-5" />
        <span>Cart updated!</span>
      </div>,
      {
        style: {
          background: restaurant?.branding?.primaryColor || '#6366f1',
          color: '#fff',
        },
      }
    );
  };

  const handleCustomizationChange = (optionName: string, value: string | string[], priceModifier: number) => {
    setCustomizations((prev: any) => ({
      ...prev,
      [optionName]: { value, priceModifier },
    }));
  };

  const calculateItemPrice = () => {
    if (!selectedItem) return 0;

    let total = selectedItem.price;
    Object.values(customizations).forEach((custom: any) => {
      total += custom.priceModifier;
    });

    return total;
  };

  const handleAddToCart = async () => {
    if (!selectedItem) return;

    // Validate required customizations
    const requiredOptions = selectedItem.customizationOptions?.filter((opt) => opt.required) || [];
    for (const option of requiredOptions) {
      if (!customizations[option.name]) {
        toast.error(`Please select ${option.name}`);
        return;
      }
    }

    setIsAddingToCart(true);

    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));

    const itemPrice = calculateItemPrice();
    const customizationsArray = Object.entries(customizations).map(([name, data]: [string, any]) => ({
      name,
      options: Array.isArray(data.value) ? data.value : [data.value],
      priceModifier: data.priceModifier,
    }));

    const cartItem: CartItem = {
      menuItemId: selectedItem._id,
      name: selectedItem.name,
      price: itemPrice,
      quantity,
      customizations: customizationsArray,
      subtotal: itemPrice * quantity,
      specialInstructions: specialInstructions || undefined,
      image: selectedItem.image,
    };

    addToCart(cartItem);

    toast.success(
      <div className="flex items-center space-x-2">
        <ShoppingBag className="h-5 w-5" />
        <span>{selectedItem.name} added to cart!</span>
      </div>,
      {
        style: {
          background: restaurant?.branding?.primaryColor || '#6366f1',
          color: '#fff',
        },
      }
    );

    setIsAddingToCart(false);
    handleCloseModal();
  };

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      addToHistory(query);
      setShowSearchHistory(false);
    }
  };

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value.trim()) {
      params.set('search', value);
    } else {
      params.delete('search');
      setShowSearchHistory(false);
    }
    setSearchParams(params);
  };

  const handleSearchHistoryClick = (term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('search', term);
    setSearchParams(params);
    setShowSearchHistory(false);
    addToHistory(term);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (categoryId) {
      params.set('category', categoryId);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
    setDietaryFilters({
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      nonVeg: false,
    });
  };

  const primaryColor = restaurant?.branding?.primaryColor || '#6366f1';
  const secondaryColor = restaurant?.branding?.secondaryColor || '#8b5cf6';

  if (loading) {
    return (
      <>
        <SEO
          title="Menu"
          description="Browse our delicious menu and order your favorite dishes"
          keywords={['menu', 'food', 'dishes', 'order online']}
        />
        <div className="min-h-screen bg-white">
          <Header />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
              <Breadcrumbs />
            </div>
            <MenuGridSkeleton count={9} />
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEO
          title="Menu"
          description="Browse our delicious menu and order your favorite dishes"
          keywords={['menu', 'food', 'dishes', 'order online']}
        />
        <ErrorMessage title="Error Loading Menu" message={error} onRetry={fetchData} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Menu"
        description="Browse our delicious menu and order your favorite dishes"
        keywords={['menu', 'food', 'dishes', 'order online', 'restaurant menu']}
      />
      <Header />

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs />
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white shadow border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative search-container">
            <Input
              type="text"
              placeholder="Search delicious dishes..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setShowSearchHistory(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit(searchQuery);
                }
              }}
              leftIcon={<Search className="h-5 w-5" />}
              rightIcon={
                searchQuery ? (
                  <button
                    onClick={() => {
                      handleSearchChange('');
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                ) : undefined
              }
              className="text-lg"
            />

            {/* Search History Dropdown */}
            {showSearchHistory && history.length > 0 && !searchQuery && (
              <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700">Recent Searches</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearHistory();
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Clear All
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {history.map((term, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors group"
                      onClick={() => handleSearchHistoryClick(term)}
                    >
                      <div className="flex items-center space-x-3">
                        <Search className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{term}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromHistory(term);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {searchQuery && (
            <p className="mt-2 text-sm text-gray-600">
              Found {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} matching "{searchQuery}"
            </p>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />

      {/* Dietary Type Filter */}
      <div className="bg-white border-t border-gray-200 shadow-sm sticky top-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Filter className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Dietary Filters</span>
              {Object.values(dietaryFilters).some(v => v) && (
                <Badge
                  variant="primary"
                  size="sm"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  }}
                >
                  {Object.values(dietaryFilters).filter(v => v).length} active
                </Badge>
              )}
            </div>
            <button
              onClick={() => setShowDietaryFilter(!showDietaryFilter)}
              className="flex items-center space-x-2 text-sm font-medium transition-colors"
              style={{ color: primaryColor }}
            >
              <span>{showDietaryFilter ? 'Hide' : 'Show'}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showDietaryFilter ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {/* Dropdown with checkboxes */}
          {showDietaryFilter && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <label className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-all">
                  <input
                    type="checkbox"
                    checked={dietaryFilters.vegetarian}
                    onChange={(e) =>
                      setDietaryFilters({ ...dietaryFilters, vegetarian: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-indigo-500"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-sm font-medium text-gray-700">🌱 Vegetarian</span>
                </label>

                <label className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-all">
                  <input
                    type="checkbox"
                    checked={dietaryFilters.vegan}
                    onChange={(e) =>
                      setDietaryFilters({ ...dietaryFilters, vegan: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-indigo-500"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-sm font-medium text-gray-700">🥬 Vegan</span>
                </label>

                <label className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-all">
                  <input
                    type="checkbox"
                    checked={dietaryFilters.glutenFree}
                    onChange={(e) =>
                      setDietaryFilters({ ...dietaryFilters, glutenFree: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-indigo-500"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-sm font-medium text-gray-700">🌾 Gluten Free</span>
                </label>

                <label className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-all">
                  <input
                    type="checkbox"
                    checked={dietaryFilters.nonVeg}
                    onChange={(e) =>
                      setDietaryFilters({ ...dietaryFilters, nonVeg: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-indigo-500"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-sm font-medium text-gray-700">🍖 Non-Veg</span>
                </label>
              </div>

              {/* Clear all button */}
              {Object.values(dietaryFilters).some(v => v) && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => {
                      setDietaryFilters({
                        vegetarian: false,
                        vegan: false,
                        glutenFree: false,
                        nonVeg: false,
                      });
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Clear dietary filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredItems.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardBody className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No items found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : 'Try selecting a different category'}
              </p>
              {(selectedCategory || searchQuery || Object.values(dietaryFilters).some(v => v)) && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                >
                  Clear filters
                </Button>
              )}
            </CardBody>
          </Card>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedCategory
                  ? categories.find((c) => c._id === selectedCategory)?.name || 'Menu'
                  : 'All Items'}
              </h2>
              <Badge variant="info" size="lg">
                {filteredItems.length} {filteredItems.length === 1 ? 'Item' : 'Items'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredItems.map((item) => (
                <MenuItem
                  key={item._id}
                  item={item}
                  onClick={() => handleItemClick(item)}
                  onQuickAdd={handleQuickAdd}
                  cartQuantity={getCartQuantity(item._id)}
                  onQuantityChange={handleQuantityChange}
                  isFavorite={favoriteIds.has(item._id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemModal
          item={selectedItem}
          quantity={quantity}
          setQuantity={setQuantity}
          customizations={customizations}
          onCustomizationChange={handleCustomizationChange}
          specialInstructions={specialInstructions}
          setSpecialInstructions={setSpecialInstructions}
          calculatePrice={calculateItemPrice}
          onClose={handleCloseModal}
          onAddToCart={handleAddToCart}
          isAddingToCart={isAddingToCart}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
      )}
    </div>
  );
};

// Item Modal Component
interface ItemModalProps {
  item: MenuItemType;
  quantity: number;
  setQuantity: (q: number) => void;
  customizations: any;
  onCustomizationChange: (name: string, value: string | string[], priceModifier: number) => void;
  specialInstructions: string;
  setSpecialInstructions: (s: string) => void;
  calculatePrice: () => number;
  onClose: () => void;
  onAddToCart: () => void;
  isAddingToCart: boolean;
  primaryColor: string;
  secondaryColor: string;
}

const ItemModal: React.FC<ItemModalProps> = ({
  item,
  quantity,
  setQuantity,
  customizations,
  onCustomizationChange,
  specialInstructions,
  setSpecialInstructions,
  calculatePrice,
  onClose,
  onAddToCart,
  isAddingToCart,
  primaryColor,
  secondaryColor,
}) => {
  const itemPrice = calculatePrice();
  const totalPrice = itemPrice * quantity;

  // Get image URL handling both old and new formats
  const getImageUrl = (item: MenuItemType): string | null => {
    const imagePath = item.images?.original || item.image;
    if (!imagePath) return null;

    // If already a full URL, use as-is
    if (imagePath.startsWith('http')) return imagePath;

    // Otherwise, prepend backend URL
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${baseUrl}${imagePath}`;
  };

  const imageUrl = getImageUrl(item);

  return (
    <Modal isOpen={true} onClose={onClose} title={item.name} size="lg">
      <ModalBody>
        {/* Image */}
        {imageUrl && (
          <div className="relative h-64 -mt-6 -mx-6 mb-6 rounded-t-2xl overflow-hidden">
            <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            {/* Dietary Badges on Image */}
            {(item.isVegetarian || item.isVegan || item.isGlutenFree) && (
              <div className="absolute top-4 right-4 flex flex-wrap gap-2">
                {item.isVegetarian && (
                  <Badge variant="success" size="sm">Vegetarian</Badge>
                )}
                {item.isVegan && (
                  <Badge variant="success" size="sm">Vegan</Badge>
                )}
                {item.isGlutenFree && (
                  <Badge variant="info" size="sm">Gluten-Free</Badge>
                )}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {item.description && (
          <p className="text-gray-600 mb-6 leading-relaxed">{item.description}</p>
        )}

        {/* Price and Prep Time */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Price</p>
            <p className="text-2xl font-bold" style={{ color: primaryColor }}>
              ${itemPrice.toFixed(2)}
            </p>
          </div>
          {item.preparationTime && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Prep Time</p>
              <p className="text-lg font-semibold text-gray-800">{item.preparationTime} min</p>
            </div>
          )}
        </div>

        {/* Customization Options */}
        {item.customizationOptions && item.customizationOptions.length > 0 && (
          <div className="space-y-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900">Customize Your Order</h3>
            {item.customizationOptions.map((option) => (
              <CustomizationOption
                key={option.name}
                option={option}
                selectedValue={customizations[option.name]?.value}
                onChange={onCustomizationChange}
              />
            ))}
          </div>
        )}

        {/* Special Instructions */}
        <div className="mb-6">
          <TextArea
            label="Special Instructions (Optional)"
            placeholder="E.g., No onions, extra sauce, mild spice..."
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            rows={3}
            helperText="Let us know if you have any special requests or allergies"
          />
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <span className="text-lg font-semibold text-gray-900">Quantity</span>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}
            >
              <Minus className="h-5 w-5" />
            </button>
            <span className="text-2xl font-bold text-gray-900 w-12 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <div className="flex space-x-3 w-full">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onAddToCart}
            isLoading={isAddingToCart}
            className="flex-1"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            Add to Cart - ${totalPrice.toFixed(2)}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

// Customization Option Component
interface CustomizationOptionProps {
  option: Customization;
  selectedValue: string | string[];
  onChange: (name: string, value: string | string[], priceModifier: number) => void;
}

const CustomizationOption: React.FC<CustomizationOptionProps> = ({
  option,
  selectedValue,
  onChange,
}) => {
  if (option.type === 'single') {
    return (
      <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
        <label className="block text-base font-semibold text-gray-900 mb-3">
          {option.name} {option.required && <span className="text-red-500">*</span>}
        </label>
        <div className="space-y-2">
          {option.options.map((opt) => {
            const isSelected = selectedValue === opt.label;
            return (
              <label
                key={opt.label}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-50 border-2 border-indigo-500'
                    : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name={option.name}
                    checked={isSelected}
                    onChange={() => onChange(option.name, opt.label, opt.priceModifier)}
                    className="w-5 h-5 text-indigo-600"
                  />
                  <span className="text-gray-900 font-medium">{opt.label}</span>
                </div>
                {opt.priceModifier !== 0 && (
                  <Badge variant={opt.priceModifier > 0 ? 'warning' : 'success'} size="sm">
                    {opt.priceModifier > 0 ? '+' : ''}${opt.priceModifier.toFixed(2)}
                  </Badge>
                )}
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  // Multiple selection
  return (
    <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
      <label className="block text-base font-semibold text-gray-900 mb-3">
        {option.name} {option.required && <span className="text-red-500">*</span>}
        <span className="text-sm font-normal text-gray-500 ml-2">(Select multiple)</span>
      </label>
      <div className="space-y-2">
        {option.options.map((opt) => {
          const isChecked = Array.isArray(selectedValue) && selectedValue.includes(opt.label);
          return (
            <label
              key={opt.label}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                isChecked
                  ? 'bg-indigo-50 border-2 border-indigo-500'
                  : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    const currentValues = Array.isArray(selectedValue) ? selectedValue : [];
                    const newValues = e.target.checked
                      ? [...currentValues, opt.label]
                      : currentValues.filter((v) => v !== opt.label);
                    const totalModifier = option.options
                      .filter((o) => newValues.includes(o.label))
                      .reduce((sum, o) => sum + o.priceModifier, 0);
                    onChange(option.name, newValues, totalModifier);
                  }}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
                <span className="text-gray-900 font-medium">{opt.label}</span>
              </div>
              {opt.priceModifier !== 0 && (
                <Badge variant={opt.priceModifier > 0 ? 'warning' : 'success'} size="sm">
                  {opt.priceModifier > 0 ? '+' : ''}${opt.priceModifier.toFixed(2)}
                </Badge>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default Menu;
