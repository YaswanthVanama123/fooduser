# Patlinks User App (Customer Frontend)

Customer-facing web application for the Patlinks multi-tenant food ordering platform.

---

## Features

- **Multi-Tenant Support**: Subdomain-based restaurant identification
- **Table Selection**: Choose your table before ordering
- **Browse Menu**: Search and filter menu items by category
- **Customizations**: Add customizations and special instructions
- **Shopping Cart**: Review and modify orders before placing
- **Real-Time Tracking**: Track order status with Socket.io updates
- **Dynamic Branding**: Restaurant-specific colors and logos

---

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **React Router** for navigation
- **Axios** for API calls
- **Socket.io Client** for real-time updates
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hot Toast** for notifications

---

## Getting Started

### Prerequisites

- Node.js 18+
- Backend server running on `http://localhost:5000`
- Demo restaurants seeded (run `npm run seed:multi` in backend)

### Installation

1. **Install dependencies**:
```bash
cd packages/user-app
npm install
```

2. **Environment Setup**:
```bash
cp .env.example .env
# Edit .env if needed (defaults work for local development)
```

3. **Start Development Server**:
```bash
npm run dev
```

The app will start at `http://localhost:5173`

---

## Local Development with Subdomains

To test multi-tenant functionality locally, you need to set up subdomain routing:

### Option 1: Using /etc/hosts (Recommended)

1. **Edit your hosts file**:
```bash
sudo nano /etc/hosts
```

2. **Add subdomain entries**:
```
127.0.0.1 pizzahut.localhost
127.0.0.1 burgerking.localhost
127.0.0.1 tacobell.localhost
```

3. **Access the app**:
- Pizza Hut: `http://pizzahut.localhost:5173`
- Burger King: `http://burgerking.localhost:5173`
- Taco Bell: `http://tacobell.localhost:5173`

### Option 2: Using localStorage Override

1. **Open browser console** on `http://localhost:5173`

2. **Set subdomain manually**:
```javascript
localStorage.setItem('dev_subdomain', 'pizzahut');
```

3. **Reload the page**

---

## Application Flow

### 1. Restaurant Detection
- App extracts subdomain from URL
- Fetches restaurant information from backend
- Applies dynamic branding (colors, logo)
- Connects to restaurant-specific Socket.io namespace

### 2. Table Selection
- Customer selects their table number
- Table information stored in localStorage
- Navigates to menu page

### 3. Menu Browsing
- View all menu items with search and category filters
- Click item to see details and customizations
- Add items to cart with quantity and special instructions

### 4. Cart & Checkout
- Review cart items
- Modify quantities or remove items
- Add order notes
- Place order

### 5. Order Tracking
- Real-time order status updates via Socket.io
- Visual progress timeline
- Notifications when status changes

---

## Project Structure

```
packages/user-app/
├── src/
│   ├── api/                    # API layer (organized by resource)
│   │   ├── client.ts          # Axios client with interceptors
│   │   ├── restaurant.api.ts  # Restaurant endpoints
│   │   ├── categories.api.ts  # Categories endpoints
│   │   ├── menu.api.ts        # Menu items endpoints
│   │   ├── tables.api.ts      # Tables endpoints
│   │   ├── orders.api.ts      # Orders endpoints
│   │   └── index.ts           # API exports
│   ├── components/            # Reusable UI components
│   │   ├── Header.tsx
│   │   ├── MenuItem.tsx
│   │   ├── CategoryFilter.tsx
│   │   ├── OrderStatusBadge.tsx
│   │   ├── Loading.tsx
│   │   └── ErrorMessage.tsx
│   ├── context/               # React contexts
│   │   ├── RestaurantContext.tsx  # Restaurant info & branding
│   │   ├── CartContext.tsx        # Shopping cart state
│   │   └── SocketContext.tsx      # Socket.io connection
│   ├── pages/                 # Page components
│   │   ├── TableSelection.tsx
│   │   ├── Menu.tsx
│   │   ├── Cart.tsx
│   │   └── OrderTracking.tsx
│   ├── services/              # Service layer
│   │   └── socket.ts          # Socket.io service
│   ├── types/                 # TypeScript types
│   │   └── index.ts
│   ├── utils/                 # Utility functions
│   │   └── subdomain.ts       # Subdomain detection
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── .env.example               # Environment variables template
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## Multi-Tenant Architecture

### Subdomain Detection
The app uses the `extractSubdomain()` utility to identify which restaurant the customer is ordering from:

```typescript
// pizzahut.patlinks.com → "pizzahut"
// pizzahut.localhost:5173 → "pizzahut"
const { subdomain } = extractSubdomain();
```

### API Integration
All API requests include restaurant identification headers:
- `x-restaurant-id`: Restaurant ID (from localStorage)
- `x-subdomain`: Restaurant subdomain

### Socket.io Namespaces
Each restaurant has an isolated Socket.io namespace:
```
/restaurant/{restaurantId}
```

Real-time events are scoped per restaurant:
- `order-status-updated`: Order status changes
- `order-updated`: Order details updated
- `table-joined`: Customer joined table room

### Dynamic Branding
Restaurant branding is applied via CSS variables:
```css
--color-primary: #E60000    /* Pizza Hut red */
--color-secondary: #FFFFFF
--color-accent: #FFD700
```

---

## Key Features Explained

### Shopping Cart
- **Persistent**: Stored in localStorage
- **Customizations**: Supports item-level customizations
- **Quantities**: Update quantities before checkout
- **Special Instructions**: Per-item notes

### Real-Time Tracking
- **Socket.io**: Connects to restaurant namespace
- **Auto-Updates**: Order status changes reflected instantly
- **Connection Status**: Visual indicator of real-time connection
- **Events**: Listens for `order-status-updated` and `order-updated`

### Responsive Design
- **Mobile-First**: Optimized for mobile ordering
- **Tailwind CSS**: Utility-first styling
- **Grid Layouts**: Responsive menu and table grids

---

## Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Production
npm run build            # Build for production
npm run preview          # Preview production build

# Linting
npm run lint             # Run ESLint
```

---

## Environment Variables

See `.env.example` for all configuration options:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## API Endpoints Used

### Public Endpoints (No Auth Required)

- `GET /api/restaurant/info` - Get restaurant by subdomain
- `GET /api/categories` - Get menu categories
- `GET /api/menu` - Get menu items
- `GET /api/tables` - Get available tables
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Track order

---

## Demo Restaurants

After running `npm run seed:multi` in the backend, three demo restaurants are available:

### Pizza Hut
- Subdomain: `pizzahut`
- Colors: Red (#E60000) and Gold (#FFD700)
- Menu: Pizzas, sides, desserts

### Burger King
- Subdomain: `burgerking`
- Colors: Red (#D62300) and Yellow (#FDB913)
- Menu: Burgers, fries, drinks

### Taco Bell
- Subdomain: `tacobell`
- Colors: Purple (#702082) and Pink (#A77BCA)
- Menu: Tacos, burritos, quesadillas

---

## Development Tips

### Testing Subdomain Routing
1. Use `/etc/hosts` for realistic subdomain testing
2. Or use localStorage override for quick switching
3. Backend must be running with seeded data

### Debugging Socket.io
```javascript
// In browser console
socket.io.opts.debug = true;
```

### Clear Cart
```javascript
// In browser console
localStorage.removeItem('cart');
```

### Switch Restaurants
```javascript
// In browser console
localStorage.setItem('dev_subdomain', 'burgerking');
location.reload();
```

---

## Production Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Set production values:
```env
VITE_API_URL=https://api.patlinks.com
VITE_SOCKET_URL=https://api.patlinks.com
VITE_API_DOMAIN=patlinks.com
```

### DNS Configuration
Configure wildcard DNS for subdomains:
```
*.patlinks.com → Your server IP
```

### Deploy
Deploy the `dist/` folder to:
- **Vercel**: Automatic subdomain support
- **Netlify**: Configure wildcard subdomain
- **AWS S3 + CloudFront**: Set up subdomain routing
- **Your own server**: Configure Nginx/Apache for subdomains

---

## Troubleshooting

### "Restaurant Not Found"
- Check subdomain spelling
- Ensure backend is running
- Verify restaurant exists in database

### "No Connection" (Socket.io)
- Check backend Socket.io server is running
- Verify `VITE_SOCKET_URL` is correct
- Check browser console for connection errors

### Cart Not Persisting
- Check localStorage is enabled
- Try clearing localStorage and reloading

### Styling Issues
- Run `npm install` to ensure Tailwind is installed
- Check `tailwind.config.js` configuration

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## Support

For issues or questions:
- **Backend Documentation**: See `packages/backend/README.md`
- **API Documentation**: See `packages/backend/API_DOCUMENTATION.md`
- **GitHub Issues**: Create an issue on the repository

---

**Built with ❤️ for Patlinks**

*Last Updated: 2024-01-08*
