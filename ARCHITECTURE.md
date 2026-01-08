# Patlinks User App - Architecture Documentation

## Overview

The User App is a modern, scalable, and maintainable React application built with TypeScript, featuring a clean architecture with clear separation of concerns.

---

## Architecture Principles

### 1. **Separation of Concerns**
- Clear boundaries between UI, business logic, and data layer
- Each component/module has a single, well-defined responsibility

### 2. **DRY (Don't Repeat Yourself)**
- Reusable components, hooks, and utilities
- Centralized API calls and configuration

### 3. **Type Safety**
- Full TypeScript coverage
- Strict type checking enabled
- Centralized type definitions

### 4. **Scalability**
- Modular folder structure
- Easy to add new features without breaking existing code
- Clear import/export patterns

### 5. **Performance**
- Code splitting at route level
- Lazy loading where applicable
- Optimized re-renders with React hooks

---

## Folder Structure

```
packages/user-app/src/
├── api/                    # API Layer (Data Access)
│   ├── client.ts          # Axios instance with interceptors
│   ├── restaurant.api.ts  # Restaurant endpoints
│   ├── categories.api.ts  # Categories endpoints
│   ├── menu.api.ts        # Menu items endpoints
│   ├── tables.api.ts      # Tables endpoints
│   ├── orders.api.ts      # Orders endpoints
│   └── index.ts           # Centralized API exports
│
├── components/            # Reusable UI Components
│   ├── Header.tsx         # App header with navigation
│   ├── MenuItem.tsx       # Menu item card
│   ├── CategoryFilter.tsx # Category filter bar
│   ├── OrderStatusBadge.tsx # Order status indicator
│   ├── Loading.tsx        # Loading spinner
│   ├── ErrorMessage.tsx   # Error display component
│   └── index.ts           # Component exports
│
├── constants/             # Application Constants
│   └── index.ts           # Configuration values, feature flags
│
├── context/               # React Context Providers
│   ├── RestaurantContext.tsx # Restaurant info & branding
│   ├── CartContext.tsx       # Shopping cart state
│   └── SocketContext.tsx     # Socket.io connection
│
├── hooks/                 # Custom React Hooks
│   ├── useCategories.ts   # Fetch & manage categories
│   ├── useMenu.ts         # Fetch & manage menu items
│   ├── useTables.ts       # Fetch & manage tables
│   ├── useOrder.ts        # Fetch & track order
│   ├── usePlaceOrder.ts   # Place order logic
│   ├── useDebounce.ts     # Debounce utility hook
│   └── index.ts           # Hook exports
│
├── pages/                 # Page-Level Components (Routes)
│   ├── TableSelection.tsx # Table selection screen
│   ├── Menu.tsx           # Menu browsing & ordering
│   ├── Cart.tsx           # Cart review & checkout
│   └── OrderTracking.tsx  # Real-time order tracking
│
├── services/              # Service Layer
│   └── socket.ts          # Socket.io service class
│
├── types/                 # TypeScript Type Definitions
│   └── index.ts           # All interfaces and types
│
├── utils/                 # Utility Functions
│   ├── subdomain.ts       # Subdomain detection
│   ├── format.ts          # Formatting utilities
│   ├── validation.ts      # Validation utilities
│   └── index.ts           # Utility exports
│
├── App.tsx                # Main app component
├── main.tsx               # Application entry point
└── index.css              # Global styles (Tailwind)
```

---

## Layer Architecture

### 1. API Layer (`/api`)

**Purpose**: Centralized data fetching and API communication

**Key Features**:
- Axios instance with request/response interceptors
- Multi-tenant header injection (restaurantId, subdomain)
- Error handling and logging
- Organized by resource/domain

**Example**:
```typescript
// api/menu.api.ts
export const menuApi = {
  getAll: async (filters?) => { /* ... */ },
  getById: async (id: string) => { /* ... */ },
  search: async (query: string) => { /* ... */ },
};
```

**Interceptor Features**:
- Auto-inject `x-restaurant-id` header
- Auto-inject `x-subdomain` header
- Global error logging

---

### 2. Components Layer (`/components`)

**Purpose**: Reusable UI components

**Component Types**:
1. **Layout Components**: Header, Loading, ErrorMessage
2. **Domain Components**: MenuItem, CategoryFilter, OrderStatusBadge

**Best Practices**:
- Each component is self-contained
- Props are well-typed with TypeScript interfaces
- Components are pure when possible
- Dynamic styling based on restaurant branding

**Example**:
```typescript
interface MenuItemProps {
  item: MenuItem;
  onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, onClick }) => {
  // Component logic
};
```

---

### 3. Context Layer (`/context`)

**Purpose**: Global state management

**Contexts**:
1. **RestaurantContext**: Restaurant info, branding, subdomain
2. **CartContext**: Shopping cart, table info, cart operations
3. **SocketContext**: Socket.io connection management

**Pattern**:
```typescript
// Context definition
export interface RestaurantContextType {
  restaurant: Restaurant | null;
  loading: boolean;
  error: string | null;
  // ... methods
}

// Provider component
export const RestaurantProvider: React.FC<{ children }> = ({ children }) => {
  // State and logic
  return (
    <RestaurantContext.Provider value={...}>
      {children}
    </RestaurantContext.Provider>
  );
};

// Custom hook
export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) throw new Error('...');
  return context;
};
```

---

### 4. Hooks Layer (`/hooks`)

**Purpose**: Reusable stateful logic

**Custom Hooks**:
- `useCategories`: Fetch categories with loading/error state
- `useMenu`: Fetch menu items with filtering
- `useTables`: Fetch available tables
- `useOrder`: Fetch and track order
- `usePlaceOrder`: Order placement logic
- `useDebounce`: Debounce values (for search)

**Benefits**:
- Reduces code duplication
- Separates business logic from UI
- Easy to test independently
- Encourages composition over inheritance

**Example**:
```typescript
const useMenu = (initialFilters?) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMenuItems = async () => { /* ... */ };

  useEffect(() => {
    fetchMenuItems();
  }, [filters]);

  return { menuItems, loading, error, refetch };
};
```

---

### 5. Pages Layer (`/pages`)

**Purpose**: Route-level components

**Pages**:
1. **TableSelection**: Customer selects table
2. **Menu**: Browse and add items to cart
3. **Cart**: Review cart and place order
4. **OrderTracking**: Track order with real-time updates

**Characteristics**:
- Composed of smaller components
- Use custom hooks for data fetching
- Handle navigation and routing
- Minimal business logic (delegated to hooks)

---

### 6. Services Layer (`/services`)

**Purpose**: Business logic and external integrations

**Services**:
- **socket.ts**: Socket.io connection management
  - Connect to restaurant-specific namespace
  - Join/leave rooms
  - Track orders
  - Event handlers

**Pattern**:
```typescript
class SocketService {
  private socket: Socket | null = null;

  connect(restaurantId: string): Socket { /* ... */ }
  disconnect(): void { /* ... */ }
  joinTable(tableNumber: string): void { /* ... */ }
  trackOrder(orderId: string): void { /* ... */ }
}

export default new SocketService();
```

---

### 7. Utilities Layer (`/utils`)

**Purpose**: Pure utility functions

**Utilities**:
1. **subdomain.ts**: Subdomain detection and URL construction
2. **format.ts**: Currency, date, time formatting
3. **validation.ts**: Form validation helpers

**Characteristics**:
- Pure functions (no side effects)
- Well-tested
- Reusable across the app

---

### 8. Constants Layer (`/constants`)

**Purpose**: Application-wide configuration

**Constants**:
- API configuration
- Socket.io configuration
- Cart configuration
- Order status mappings
- Toast notification config
- UI defaults
- Feature flags

**Benefits**:
- Single source of truth
- Easy to update configuration
- Type-safe constants

---

## Data Flow

### Unidirectional Data Flow

```
User Action
    ↓
Page Component
    ↓
Custom Hook (useMenu, usePlaceOrder, etc.)
    ↓
API Layer (menuApi, ordersApi, etc.)
    ↓
Axios Client (with interceptors)
    ↓
Backend API
    ↓
Response flows back up the chain
    ↓
State Update (useState, Context)
    ↓
UI Re-render
```

### Real-Time Updates Flow

```
Backend Event (order status change)
    ↓
Socket.io Server
    ↓
Restaurant Namespace (/restaurant/{id})
    ↓
SocketService
    ↓
Page Component (useEffect listener)
    ↓
State Update
    ↓
UI Re-render with new data
```

---

## Multi-Tenant Architecture

### Subdomain Detection

```typescript
// Extract subdomain from URL
const { subdomain } = extractSubdomain();
// pizzahut.patlinks.com → "pizzahut"
```

### API Request Flow

1. **User makes request** (e.g., fetch menu)
2. **API client interceptor** adds headers:
   - `x-restaurant-id`: From localStorage
   - `x-subdomain`: From URL
3. **Backend validates** tenant context
4. **Returns tenant-scoped data**

### Socket.io Namespace Isolation

```typescript
// Connect to restaurant-specific namespace
const namespace = `/restaurant/${restaurantId}`;
const socket = io(`${SOCKET_URL}${namespace}`);

// All events are scoped to this restaurant
socket.on('order-status-updated', (data) => { /* ... */ });
```

---

## State Management Strategy

### 1. **Local State** (useState)
- Component-specific state
- Form inputs, UI toggles
- Temporary/ephemeral data

### 2. **Context State** (useContext)
- Global application state
- Restaurant info, cart, socket connection
- Shared across many components

### 3. **Server State** (Custom Hooks)
- Data from backend
- Managed via custom hooks
- Loading, error, data states

### 4. **URL State** (useParams, useSearchParams)
- Navigation state
- Order ID, filter params
- Shareable links

---

## Performance Optimizations

### 1. **Code Splitting**
- Route-based code splitting with React.lazy
- Reduces initial bundle size

### 2. **Memoization**
- React.memo for expensive components
- useMemo for expensive calculations
- useCallback for stable function references

### 3. **Efficient Re-renders**
- Context split by concern (Restaurant, Cart, Socket)
- Prevents unnecessary re-renders

### 4. **Debouncing**
- Search input debounced
- Reduces API calls

### 5. **Image Optimization**
- Lazy loading images
- Proper image sizing

---

## Type Safety

### TypeScript Strategy

1. **Strict Mode Enabled**
   - No implicit any
   - Strict null checks
   - Strict function types

2. **Centralized Types**
   - All types in `/types/index.ts`
   - Shared across app

3. **API Response Types**
   - Typed API responses
   - Type-safe data access

4. **Component Props**
   - All props fully typed
   - No prop-types needed

---

## Error Handling

### Levels of Error Handling

1. **API Layer**
   - Axios interceptors catch all errors
   - Log to console in development
   - Return error object

2. **Custom Hooks**
   - Catch errors from API calls
   - Set error state
   - Return error to component

3. **Component Layer**
   - Display error messages
   - Provide retry actions
   - Toast notifications

4. **Global Error Boundary**
   - Catch React rendering errors
   - Display fallback UI

---

## Testing Strategy

### Unit Tests
- Utility functions
- Custom hooks
- Pure components

### Integration Tests
- API layer
- Context providers
- Page components

### E2E Tests
- Critical user flows
- Multi-tenant scenarios
- Real-time updates

---

## Security Considerations

### 1. **XSS Prevention**
- React escapes content by default
- Sanitize user inputs
- No `dangerouslySetInnerHTML`

### 2. **API Security**
- HTTPS in production
- CORS configured properly
- JWT tokens in headers (when auth added)

### 3. **Data Isolation**
- Tenant validation on every request
- Backend enforces data segregation
- Cannot access other restaurants' data

---

## Deployment

### Build Process

```bash
npm run build
# Output: dist/
```

### Environment Variables

Production `.env`:
```env
VITE_API_URL=https://api.patlinks.com
VITE_SOCKET_URL=https://api.patlinks.com
VITE_API_DOMAIN=patlinks.com
```

### Hosting Options

1. **Vercel** (Recommended)
   - Automatic subdomain support
   - Edge network
   - Zero config

2. **Netlify**
   - Configure wildcard subdomain
   - Redirect rules

3. **AWS S3 + CloudFront**
   - S3 for static hosting
   - CloudFront for CDN
   - Route 53 for DNS

---

## Future Enhancements

### Planned Improvements

1. **Authentication**
   - User accounts
   - Order history
   - Saved preferences

2. **Payment Integration**
   - Stripe integration
   - Multiple payment methods

3. **Progressive Web App**
   - Service workers
   - Offline support
   - Install prompt

4. **Analytics**
   - User behavior tracking
   - Conversion funnel
   - A/B testing

5. **Internationalization**
   - Multi-language support
   - Currency localization

---

## Best Practices

### Code Organization

1. **One component per file**
2. **Colocate related code**
3. **Use barrel exports (index.ts)**
4. **Keep components small (<300 lines)**

### Naming Conventions

1. **Components**: PascalCase (`MenuItem.tsx`)
2. **Hooks**: camelCase with "use" prefix (`useMenu.ts`)
3. **Utilities**: camelCase (`formatCurrency`)
4. **Constants**: UPPER_SNAKE_CASE (`API_CONFIG`)
5. **Types**: PascalCase (`MenuItem`, `Order`)

### Import Order

1. External libraries (React, etc.)
2. Internal modules (components, hooks)
3. Types
4. Styles

---

## Conclusion

This architecture provides:
- ✅ **Scalability**: Easy to add features
- ✅ **Maintainability**: Clear code organization
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Performance**: Optimized rendering
- ✅ **Developer Experience**: Intuitive structure
- ✅ **Multi-Tenancy**: Robust isolation

---

**Last Updated**: 2024-01-08
**Version**: 1.0.0
