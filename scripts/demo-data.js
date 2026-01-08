#!/usr/bin/env node

/**
 * Demo Data Script
 *
 * Creates realistic demo data for testing:
 * - Demo restaurants with complete details
 * - Menu items with categories and images
 * - Sample orders at different stages
 * - Customer reviews (if implemented)
 */

const axios = require('axios');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:5000';

// Super Admin credentials
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'superadmin@patlinks.com';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';

// Color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
  console.log('\n' + '='.repeat(70));
  log(message, colors.bright + colors.cyan);
  console.log('='.repeat(70) + '\n');
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.yellow);
}

// Demo data
let demoData = {
  token: null,
  restaurants: [],
  admins: [],
};

// Demo restaurants
const restaurantsData = [
  {
    name: 'Pizza Palace',
    email: 'info@pizzapalace.com',
    phone: '555-0101',
    subdomain: 'pizzapalace',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    cuisineType: 'Italian',
    description: 'Authentic Italian pizzas made with love and fresh ingredients',
    isActive: true,
  },
  {
    name: 'Burger House',
    email: 'info@burgerhouse.com',
    phone: '555-0102',
    subdomain: 'burgerhouse',
    address: {
      street: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA'
    },
    cuisineType: 'American',
    description: 'Gourmet burgers and comfort food at its finest',
    isActive: true,
  },
  {
    name: 'Sushi Station',
    email: 'info@sushistation.com',
    phone: '555-0103',
    subdomain: 'sushistation',
    address: {
      street: '789 Pine Road',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94101',
      country: 'USA'
    },
    cuisineType: 'Japanese',
    description: 'Fresh sushi and Japanese cuisine prepared by expert chefs',
    isActive: true,
  },
];

// Menu items by restaurant type
const menuItemsData = {
  'Pizza Palace': [
    {
      name: 'Margherita Pizza',
      description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
      price: 12.99,
      category: 'Pizza',
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002',
      isAvailable: true,
      isVegetarian: true,
    },
    {
      name: 'Pepperoni Pizza',
      description: 'Traditional pepperoni pizza with extra cheese',
      price: 14.99,
      category: 'Pizza',
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e',
      isAvailable: true,
    },
    {
      name: 'Four Cheese Pizza',
      description: 'Delicious blend of mozzarella, parmesan, gorgonzola, and ricotta',
      price: 15.99,
      category: 'Pizza',
      image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f',
      isAvailable: true,
      isVegetarian: true,
    },
    {
      name: 'Veggie Supreme',
      description: 'Loaded with fresh vegetables and herbs',
      price: 13.99,
      category: 'Pizza',
      image: 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a',
      isAvailable: true,
      isVegetarian: true,
    },
    {
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with Caesar dressing and croutons',
      price: 8.99,
      category: 'Salad',
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1',
      isAvailable: true,
      isVegetarian: true,
    },
    {
      name: 'Garlic Bread',
      description: 'Toasted bread with garlic butter and herbs',
      price: 5.99,
      category: 'Appetizer',
      image: 'https://images.unsplash.com/photo-1573140401552-388e295b4129',
      isAvailable: true,
      isVegetarian: true,
    },
    {
      name: 'Tiramisu',
      description: 'Classic Italian dessert with coffee and mascarpone',
      price: 7.99,
      category: 'Dessert',
      image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9',
      isAvailable: true,
      isVegetarian: true,
    },
  ],
  'Burger House': [
    {
      name: 'Classic Burger',
      description: 'Beef patty with lettuce, tomato, onion, and special sauce',
      price: 10.99,
      category: 'Burger',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
      isAvailable: true,
    },
    {
      name: 'Cheeseburger Deluxe',
      description: 'Double beef patty with cheddar cheese and bacon',
      price: 13.99,
      category: 'Burger',
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349',
      isAvailable: true,
    },
    {
      name: 'Veggie Burger',
      description: 'Plant-based patty with avocado and sprouts',
      price: 11.99,
      category: 'Burger',
      image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360',
      isAvailable: true,
      isVegetarian: true,
    },
    {
      name: 'BBQ Bacon Burger',
      description: 'Beef patty with BBQ sauce, bacon, and onion rings',
      price: 14.99,
      category: 'Burger',
      image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b',
      isAvailable: true,
    },
    {
      name: 'French Fries',
      description: 'Crispy golden fries with sea salt',
      price: 4.99,
      category: 'Side',
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877',
      isAvailable: true,
      isVegetarian: true,
    },
    {
      name: 'Onion Rings',
      description: 'Beer-battered onion rings with dipping sauce',
      price: 5.99,
      category: 'Side',
      image: 'https://images.unsplash.com/photo-1639024471283-03518883512d',
      isAvailable: true,
      isVegetarian: true,
    },
    {
      name: 'Milkshake',
      description: 'Creamy milkshake - vanilla, chocolate, or strawberry',
      price: 6.99,
      category: 'Beverage',
      image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699',
      isAvailable: true,
      isVegetarian: true,
    },
  ],
  'Sushi Station': [
    {
      name: 'California Roll',
      description: 'Crab, avocado, and cucumber rolled in rice and nori',
      price: 11.99,
      category: 'Roll',
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351',
      isAvailable: true,
    },
    {
      name: 'Spicy Tuna Roll',
      description: 'Fresh tuna with spicy mayo and cucumber',
      price: 12.99,
      category: 'Roll',
      image: 'https://images.unsplash.com/photo-1563612116625-3012372fccce',
      isAvailable: true,
    },
    {
      name: 'Dragon Roll',
      description: 'Eel and cucumber topped with avocado and eel sauce',
      price: 15.99,
      category: 'Roll',
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351',
      isAvailable: true,
    },
    {
      name: 'Salmon Nigiri',
      description: 'Fresh salmon over pressed rice (2 pieces)',
      price: 7.99,
      category: 'Nigiri',
      image: 'https://images.unsplash.com/photo-1564489563601-c53cfc451e93',
      isAvailable: true,
    },
    {
      name: 'Tuna Sashimi',
      description: 'Fresh tuna slices (5 pieces)',
      price: 14.99,
      category: 'Sashimi',
      image: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10',
      isAvailable: true,
    },
    {
      name: 'Miso Soup',
      description: 'Traditional Japanese soup with tofu and seaweed',
      price: 3.99,
      category: 'Soup',
      image: 'https://images.unsplash.com/photo-1584255014406-2a68ea38e48c',
      isAvailable: true,
      isVegetarian: true,
    },
    {
      name: 'Edamame',
      description: 'Steamed soybeans with sea salt',
      price: 5.99,
      category: 'Appetizer',
      image: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7',
      isAvailable: true,
      isVegetarian: true,
    },
    {
      name: 'Green Tea Ice Cream',
      description: 'Traditional Japanese green tea ice cream',
      price: 6.99,
      category: 'Dessert',
      image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb',
      isAvailable: true,
      isVegetarian: true,
    },
  ],
};

// Login as super admin
async function loginSuperAdmin() {
  logInfo('Logging in as super admin...');

  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD,
    });

    if (response.data && response.data.token) {
      demoData.token = response.data.token;
      logSuccess('Super admin logged in successfully');
      return true;
    }

    logError('Invalid login response');
    return false;
  } catch (error) {
    logError(`Login failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Create restaurants
async function createRestaurants() {
  logHeader('Creating Demo Restaurants');

  for (const restaurantData of restaurantsData) {
    try {
      logInfo(`Creating ${restaurantData.name}...`);

      const response = await axios.post(
        `${API_URL}/api/restaurants`,
        restaurantData,
        {
          headers: {
            Authorization: `Bearer ${demoData.token}`,
          },
        }
      );

      if (response.data && response.data._id) {
        demoData.restaurants.push(response.data);
        logSuccess(`${restaurantData.name} created successfully`);
        logInfo(`  ID: ${response.data._id}`);
        logInfo(`  Subdomain: ${response.data.subdomain}`);
      }
    } catch (error) {
      if (error.response?.status === 409 || error.response?.data?.message?.includes('already exists')) {
        logInfo(`${restaurantData.name} already exists, fetching...`);

        try {
          const getResponse = await axios.get(
            `${API_URL}/api/restaurants/subdomain/${restaurantData.subdomain}`
          );
          demoData.restaurants.push(getResponse.data);
          logSuccess(`${restaurantData.name} fetched successfully`);
        } catch (getError) {
          logError(`Failed to fetch ${restaurantData.name}`);
        }
      } else {
        logError(`Failed to create ${restaurantData.name}: ${error.response?.data?.message || error.message}`);
      }
    }
  }

  console.log('');
}

// Create restaurant admins
async function createAdmins() {
  logHeader('Creating Restaurant Admins');

  for (const restaurant of demoData.restaurants) {
    try {
      const adminData = {
        name: `${restaurant.name} Admin`,
        email: `admin@${restaurant.subdomain}.com`,
        password: 'Admin@123456',
        role: 'restaurant_admin',
        restaurant: restaurant._id,
      };

      logInfo(`Creating admin for ${restaurant.name}...`);

      const response = await axios.post(
        `${API_URL}/api/users`,
        adminData,
        {
          headers: {
            Authorization: `Bearer ${demoData.token}`,
          },
        }
      );

      if (response.data && response.data._id) {
        demoData.admins.push({
          ...response.data,
          password: adminData.password,
          restaurantName: restaurant.name,
        });
        logSuccess(`Admin created for ${restaurant.name}`);
        logInfo(`  Email: ${adminData.email}`);
        logInfo(`  Password: ${adminData.password}`);
      }
    } catch (error) {
      if (error.response?.status === 409 || error.response?.data?.message?.includes('already exists')) {
        logInfo(`Admin for ${restaurant.name} already exists`);
      } else {
        logError(`Failed to create admin for ${restaurant.name}: ${error.response?.data?.message || error.message}`);
      }
    }
  }

  console.log('');
}

// Create menu items
async function createMenuItems() {
  logHeader('Creating Menu Items');

  for (const admin of demoData.admins) {
    try {
      // Login as restaurant admin
      logInfo(`Logging in as ${admin.restaurantName} admin...`);

      const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
        email: admin.email,
        password: admin.password,
      });

      if (!loginResponse.data || !loginResponse.data.token) {
        logError(`Failed to login as ${admin.restaurantName} admin`);
        continue;
      }

      const adminToken = loginResponse.data.token;
      const restaurant = demoData.restaurants.find(r => r._id === admin.restaurant);

      if (!restaurant) {
        logError(`Restaurant not found for ${admin.restaurantName}`);
        continue;
      }

      // Get menu items for this restaurant
      const items = menuItemsData[restaurant.name] || [];

      logInfo(`Creating ${items.length} menu items for ${restaurant.name}...`);

      let createdCount = 0;
      let existingCount = 0;

      for (const itemData of items) {
        try {
          const response = await axios.post(
            `${API_URL}/api/menu-items`,
            {
              ...itemData,
              restaurant: restaurant._id,
            },
            {
              headers: {
                Authorization: `Bearer ${adminToken}`,
              },
            }
          );

          if (response.data && response.data._id) {
            createdCount++;
            log(`  ✓ ${itemData.name}`, colors.green);
          }
        } catch (itemError) {
          if (itemError.response?.status === 409) {
            existingCount++;
            log(`  ℹ ${itemData.name} (already exists)`, colors.yellow);
          } else {
            log(`  ✗ ${itemData.name}`, colors.red);
          }
        }
      }

      logSuccess(`${restaurant.name}: ${createdCount} created, ${existingCount} existing`);

    } catch (error) {
      logError(`Failed to create menu items for ${admin.restaurantName}: ${error.message}`);
    }
  }

  console.log('');
}

// Create sample orders
async function createSampleOrders() {
  logHeader('Creating Sample Orders');

  for (const restaurant of demoData.restaurants) {
    try {
      logInfo(`Creating sample orders for ${restaurant.name}...`);

      // Get menu items for this restaurant
      const menuResponse = await axios.get(`${API_URL}/api/menu-items`, {
        params: { restaurant: restaurant._id }
      });

      const menuItems = menuResponse.data;

      if (menuItems.length === 0) {
        logInfo(`No menu items found for ${restaurant.name}`);
        continue;
      }

      // Create orders with different statuses
      const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];
      let createdCount = 0;

      for (const status of statuses) {
        try {
          // Select random items
          const itemCount = Math.min(Math.floor(Math.random() * 3) + 1, menuItems.length);
          const orderItems = [];

          for (let i = 0; i < itemCount; i++) {
            const randomIndex = Math.floor(Math.random() * menuItems.length);
            const item = menuItems[randomIndex];
            orderItems.push({
              menuItem: item._id,
              name: item.name,
              price: item.price,
              quantity: Math.floor(Math.random() * 2) + 1,
              customizations: [],
            });
          }

          const orderData = {
            restaurant: restaurant._id,
            items: orderItems,
            customerInfo: {
              name: `Demo Customer ${Math.floor(Math.random() * 100)}`,
              phone: `555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
              email: `customer${Math.floor(Math.random() * 1000)}@demo.com`,
            },
            orderType: ['dine-in', 'takeaway', 'delivery'][Math.floor(Math.random() * 3)],
            tableNumber: Math.floor(Math.random() * 20) + 1,
            status: status,
            specialInstructions: 'Demo order for testing',
          };

          await axios.post(`${API_URL}/api/orders`, orderData);
          createdCount++;
          log(`  ✓ Order with status: ${status}`, colors.green);

        } catch (orderError) {
          log(`  ✗ Failed to create order with status: ${status}`, colors.red);
        }
      }

      logSuccess(`${restaurant.name}: ${createdCount} sample orders created`);

    } catch (error) {
      logError(`Failed to create sample orders for ${restaurant.name}: ${error.message}`);
    }
  }

  console.log('');
}

// Print summary
function printSummary() {
  logHeader('Demo Data Creation Summary');

  console.log(`Restaurants Created: ${demoData.restaurants.length}`);
  console.log(`Admins Created: ${demoData.admins.length}`);
  console.log('');

  if (demoData.restaurants.length > 0) {
    log('Restaurant Access:', colors.bright);
    demoData.restaurants.forEach((restaurant, index) => {
      console.log(`\n${index + 1}. ${restaurant.name}`);
      console.log(`   URL: http://${restaurant.subdomain}.localhost:5173`);
      console.log(`   Subdomain: ${restaurant.subdomain}`);

      const admin = demoData.admins.find(a => a.restaurant === restaurant._id);
      if (admin) {
        console.log(`   Admin Email: ${admin.email}`);
        console.log(`   Admin Password: ${admin.password}`);
      }
    });
  }

  console.log('\n' + '='.repeat(70));
  log('\n✓ Demo data created successfully!', colors.green + colors.bright);
  log('\nYou can now test the application with realistic data.\n', colors.cyan);
}

// Main function
async function main() {
  logHeader('Demo Data Creation Script');
  log(`API URL: ${API_URL}`, colors.bright);
  console.log('');

  try {
    // Login
    const loggedIn = await loginSuperAdmin();
    if (!loggedIn) {
      logError('Cannot proceed without super admin access');
      process.exit(1);
    }

    // Create all demo data
    await createRestaurants();
    await createAdmins();
    await createMenuItems();
    await createSampleOrders();

    // Print summary
    printSummary();

    process.exit(0);

  } catch (error) {
    logError(`Unexpected error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\n\nScript interrupted by user', colors.yellow);
  process.exit(130);
});

process.on('SIGTERM', () => {
  log('\n\nScript terminated', colors.yellow);
  process.exit(143);
});

// Run script
main();
