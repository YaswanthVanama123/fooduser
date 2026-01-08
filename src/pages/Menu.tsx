import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search, X, Plus, Minus, ShoppingBag, Clock } from 'lucide-react';
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
import { useSearchHistory } from '../hooks/useSearchHistory';
import { menuApi, categoriesApi } from '../api';
import { MenuItem as MenuItemType, Category, CartItem, Customization } from '../types';

const Menu: React.FC = () => {
  const navigate = useNavigate();
  const { tableId, addToCart } = useCart();
  const { restaurant } = useRestaurant();
  const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItemType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSearchHistory, setShowSearchHistory] = useState(false);

  // Item Modal State
  const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);
  const [customizations, setCustomizations] = useState<any>({});
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    // Redirect to table selection if no table selected
    if (!tableId) {
      navigate('/');
      return;
    }

    fetchData();
  }, [tableId]);

  useEffect(() => {
    filterItems();
  }, [selectedCategory, searchQuery, menuItems]);

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

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [categoriesResponse, menuResponse] = await Promise.all([
        categoriesApi.getAll(),
        menuApi.getAll({ available: true }),
      ]);

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      }

      if (menuResponse.success) {
        setMenuItems(menuResponse.data);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...menuItems];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((item) => item.categoryId === selectedCategory);
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
  };

  const handleItemClick = (item: MenuItemType) => {
    if (!item.isAvailable) {
      toast.error('This item is currently unavailable');
      return;
    }

    setSelectedItem(item);
    setCustomizations({});
    setQuantity(1);
    setSpecialInstructions('');
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setCustomizations({});
    setQuantity(1);
    setSpecialInstructions('');
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
    setSearchQuery(value);
    if (!value.trim()) {
      setShowSearchHistory(false);
    }
  };

  const handleSearchHistoryClick = (term: string) => {
    setSearchQuery(term);
    setShowSearchHistory(false);
    addToHistory(term);
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
      <div className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                      setSearchQuery('');
                      setShowSearchHistory(false);
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
              <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200">
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
        onSelectCategory={setSelectedCategory}
      />

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
              {(selectedCategory || searchQuery) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchQuery('');
                  }}
                >
                  Clear filters
                </Button>
              )}
            </CardBody>
          </Card>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory
                  ? categories.find((c) => c._id === selectedCategory)?.name || 'Menu'
                  : 'All Items'}
              </h2>
              <Badge variant="info" size="lg">
                {filteredItems.length} {filteredItems.length === 1 ? 'Item' : 'Items'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <MenuItem key={item._id} item={item} onClick={() => handleItemClick(item)} />
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

  return (
    <Modal isOpen={true} onClose={onClose} title={item.name} size="lg">
      <ModalBody>
        {/* Image */}
        {item.image && (
          <div className="relative h-64 -mt-6 -mx-6 mb-6 rounded-t-2xl overflow-hidden">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
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
