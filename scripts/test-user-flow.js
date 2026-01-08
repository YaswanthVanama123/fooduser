#!/usr/bin/env node

/**
 * User Flow Test Script
 *
 * This script tests the complete user journey:
 * 1. Select restaurant
 * 2. Browse menu
 * 3. Add items to cart
 * 4. Place order
 * 5. Track order status
 */

const axios = require('axios');
const io = require('socket.io-client');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:5000';
const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:5000';

// Color codes for terminal output
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

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: [],
};

// Helper functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
  console.log('\n' + '='.repeat(60));
  log(message, colors.bright + colors.cyan);
  console.log('='.repeat(60) + '\n');
}

function logTest(name) {
  log(`\n▶ Testing: ${name}`, colors.blue);
}

function logSuccess(message) {
  log(`  ✓ ${message}`, colors.green);
}

function logError(message) {
  log(`  ✗ ${message}`, colors.red);
}

function logInfo(message) {
  log(`  ℹ ${message}`, colors.yellow);
}

function recordTest(name, passed, error = null) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
  testResults.tests.push({ name, passed, error });
}

// Test data
let testData = {
  restaurant: null,
  menuItems: [],
  cart: [],
  order: null,
  socket: null,
};

// Test 1: Get restaurant by subdomain
async function testGetRestaurant(subdomain = 'pizzahut') {
  logTest('Get Restaurant by Subdomain');

  try {
    const response = await axios.get(`${API_URL}/api/restaurants/subdomain/${subdomain}`);

    if (response.data && response.data._id) {
      testData.restaurant = response.data;
      logSuccess(`Restaurant found: ${response.data.name}`);
      logInfo(`Restaurant ID: ${response.data._id}`);
      logInfo(`Status: ${response.data.isActive ? 'Active' : 'Inactive'}`);
      recordTest('Get Restaurant', true);
      return true;
    } else {
      logError('Invalid restaurant data received');
      recordTest('Get Restaurant', false, 'Invalid data');
      return false;
    }
  } catch (error) {
    logError(`Failed to get restaurant: ${error.message}`);
    recordTest('Get Restaurant', false, error.message);
    return false;
  }
}

// Test 2: Browse menu items
async function testBrowseMenu() {
  logTest('Browse Menu Items');

  if (!testData.restaurant) {
    logError('No restaurant selected');
    recordTest('Browse Menu', false, 'No restaurant selected');
    return false;
  }

  try {
    const response = await axios.get(`${API_URL}/api/menu-items`, {
      params: { restaurant: testData.restaurant._id }
    });

    if (response.data && Array.isArray(response.data)) {
      testData.menuItems = response.data.filter(item => item.isAvailable);
      logSuccess(`Found ${testData.menuItems.length} available menu items`);

      if (testData.menuItems.length > 0) {
        logInfo(`Sample items:`);
        testData.menuItems.slice(0, 3).forEach(item => {
          log(`    - ${item.name}: $${item.price}`, colors.cyan);
        });
      }

      recordTest('Browse Menu', true);
      return true;
    } else {
      logError('Invalid menu data received');
      recordTest('Browse Menu', false, 'Invalid data');
      return false;
    }
  } catch (error) {
    logError(`Failed to browse menu: ${error.message}`);
    recordTest('Browse Menu', false, error.message);
    return false;
  }
}

// Test 3: Add items to cart
async function testAddToCart() {
  logTest('Add Items to Cart');

  if (testData.menuItems.length === 0) {
    logError('No menu items available');
    recordTest('Add to Cart', false, 'No menu items');
    return false;
  }

  try {
    // Select random items (2-4 items)
    const itemCount = Math.min(Math.floor(Math.random() * 3) + 2, testData.menuItems.length);
    const selectedItems = [];

    for (let i = 0; i < itemCount; i++) {
      const randomIndex = Math.floor(Math.random() * testData.menuItems.length);
      const item = testData.menuItems[randomIndex];
      const quantity = Math.floor(Math.random() * 3) + 1;

      selectedItems.push({
        menuItem: item._id,
        name: item.name,
        price: item.price,
        quantity: quantity,
        customizations: []
      });
    }

    testData.cart = selectedItems;

    logSuccess(`Added ${selectedItems.length} items to cart`);
    let total = 0;
    selectedItems.forEach(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      log(`    - ${item.quantity}x ${item.name}: $${itemTotal.toFixed(2)}`, colors.cyan);
    });
    logInfo(`Cart total: $${total.toFixed(2)}`);

    recordTest('Add to Cart', true);
    return true;
  } catch (error) {
    logError(`Failed to add items to cart: ${error.message}`);
    recordTest('Add to Cart', false, error.message);
    return false;
  }
}

// Test 4: Place order
async function testPlaceOrder() {
  logTest('Place Order');

  if (testData.cart.length === 0) {
    logError('Cart is empty');
    recordTest('Place Order', false, 'Empty cart');
    return false;
  }

  try {
    const orderData = {
      restaurant: testData.restaurant._id,
      items: testData.cart,
      customerInfo: {
        name: 'Test Customer',
        phone: '1234567890',
        email: 'test@example.com'
      },
      orderType: 'dine-in',
      tableNumber: Math.floor(Math.random() * 20) + 1,
      specialInstructions: 'Test order - automated test',
    };

    const response = await axios.post(`${API_URL}/api/orders`, orderData);

    if (response.data && response.data._id) {
      testData.order = response.data;
      logSuccess(`Order placed successfully!`);
      logInfo(`Order ID: ${response.data._id}`);
      logInfo(`Order Number: ${response.data.orderNumber || 'N/A'}`);
      logInfo(`Status: ${response.data.status}`);
      logInfo(`Total: $${response.data.totalAmount.toFixed(2)}`);
      recordTest('Place Order', true);
      return true;
    } else {
      logError('Invalid order response');
      recordTest('Place Order', false, 'Invalid response');
      return false;
    }
  } catch (error) {
    logError(`Failed to place order: ${error.response?.data?.message || error.message}`);
    recordTest('Place Order', false, error.response?.data?.message || error.message);
    return false;
  }
}

// Test 5: Track order status via Socket.io
async function testTrackOrderStatus() {
  logTest('Track Order Status (Socket.io)');

  if (!testData.order) {
    logError('No order to track');
    recordTest('Track Order Status', false, 'No order');
    return false;
  }

  return new Promise((resolve) => {
    try {
      const socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
      });

      testData.socket = socket;

      let connectionTimeout = setTimeout(() => {
        logError('Socket connection timeout');
        socket.disconnect();
        recordTest('Track Order Status', false, 'Connection timeout');
        resolve(false);
      }, 10000);

      socket.on('connect', () => {
        clearTimeout(connectionTimeout);
        logSuccess('Connected to Socket.io server');
        logInfo(`Socket ID: ${socket.id}`);

        // Join order room
        socket.emit('joinOrder', testData.order._id);
        logInfo(`Joined order room: ${testData.order._id}`);

        // Listen for order updates
        socket.on('orderStatusUpdate', (data) => {
          logSuccess(`Received order update: ${data.status}`);
          if (data.message) {
            logInfo(`Message: ${data.message}`);
          }
        });

        // Wait a bit to ensure connection is stable
        setTimeout(() => {
          logSuccess('Socket.io connection is stable');
          recordTest('Track Order Status', true);
          resolve(true);
        }, 2000);
      });

      socket.on('connect_error', (error) => {
        clearTimeout(connectionTimeout);
        logError(`Socket connection error: ${error.message}`);
        recordTest('Track Order Status', false, error.message);
        resolve(false);
      });

    } catch (error) {
      logError(`Failed to connect to Socket.io: ${error.message}`);
      recordTest('Track Order Status', false, error.message);
      resolve(false);
    }
  });
}

// Test 6: Get order details
async function testGetOrderDetails() {
  logTest('Get Order Details');

  if (!testData.order) {
    logError('No order to retrieve');
    recordTest('Get Order Details', false, 'No order');
    return false;
  }

  try {
    const response = await axios.get(`${API_URL}/api/orders/${testData.order._id}`);

    if (response.data && response.data._id) {
      logSuccess('Order details retrieved successfully');
      logInfo(`Order ID: ${response.data._id}`);
      logInfo(`Status: ${response.data.status}`);
      logInfo(`Items: ${response.data.items.length}`);
      logInfo(`Total: $${response.data.totalAmount.toFixed(2)}`);
      recordTest('Get Order Details', true);
      return true;
    } else {
      logError('Invalid order data');
      recordTest('Get Order Details', false, 'Invalid data');
      return false;
    }
  } catch (error) {
    logError(`Failed to get order details: ${error.message}`);
    recordTest('Get Order Details', false, error.message);
    return false;
  }
}

// Print test summary
function printTestSummary() {
  logHeader('Test Summary');

  console.log(`Total Tests: ${testResults.total}`);
  log(`Passed: ${testResults.passed}`, colors.green);
  log(`Failed: ${testResults.failed}`, colors.red);

  const passRate = testResults.total > 0
    ? ((testResults.passed / testResults.total) * 100).toFixed(2)
    : 0;

  console.log(`\nPass Rate: ${passRate}%`);

  if (testResults.failed > 0) {
    log('\nFailed Tests:', colors.red);
    testResults.tests
      .filter(test => !test.passed)
      .forEach(test => {
        log(`  ✗ ${test.name}: ${test.error}`, colors.red);
      });
  }

  console.log('\n' + '='.repeat(60) + '\n');

  if (testResults.failed === 0) {
    log('🎉 All tests passed! User flow is working correctly.', colors.green + colors.bright);
  } else {
    log('⚠️  Some tests failed. Please check the errors above.', colors.yellow + colors.bright);
  }

  console.log('');
}

// Cleanup function
function cleanup() {
  if (testData.socket) {
    testData.socket.disconnect();
    logInfo('Socket.io connection closed');
  }
}

// Main test runner
async function runTests() {
  logHeader('User Flow Test Suite');

  log('Starting automated user journey test...', colors.bright);
  log(`API URL: ${API_URL}`);
  log(`Socket URL: ${SOCKET_URL}\n`);

  try {
    // Run tests sequentially
    const restaurantFound = await testGetRestaurant('pizzahut');
    if (!restaurantFound) {
      log('\n⚠️  Cannot proceed without a restaurant. Make sure to seed the database.', colors.yellow);
      printTestSummary();
      process.exit(1);
    }

    const menuLoaded = await testBrowseMenu();
    if (!menuLoaded || testData.menuItems.length === 0) {
      log('\n⚠️  Cannot proceed without menu items. Make sure to seed the database.', colors.yellow);
      printTestSummary();
      process.exit(1);
    }

    await testAddToCart();
    await testPlaceOrder();
    await testTrackOrderStatus();
    await testGetOrderDetails();

    // Print summary
    printTestSummary();

    // Cleanup
    cleanup();

    // Exit with appropriate code
    process.exit(testResults.failed === 0 ? 0 : 1);

  } catch (error) {
    logError(`Unexpected error: ${error.message}`);
    console.error(error);
    cleanup();
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\n\nTest interrupted by user', colors.yellow);
  cleanup();
  process.exit(130);
});

process.on('SIGTERM', () => {
  log('\n\nTest terminated', colors.yellow);
  cleanup();
  process.exit(143);
});

// Run tests
runTests();
