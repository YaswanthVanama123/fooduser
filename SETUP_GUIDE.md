# Patlinks User App - Complete Setup & Implementation Guide

## 🎨 UI/UX Design System

### Color Palette
The app uses dynamic branding from each restaurant, with fallback colors:
- **Primary**: `#6366f1` (Indigo)
- **Secondary**: `#8b5cf6` (Purple)
- **Accent**: `#ec4899` (Pink)
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Amber)
- **Danger**: `#ef4444` (Red)

### Typography
- **Headings**: Font weight 700-900, tracking tight
- **Body**: Font weight 400-600
- **Font Family**: System UI fonts for optimal performance

### Spacing Scale
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)

### Border Radius
- sm: 0.375rem
- md: 0.5rem
- lg: 0.75rem
- xl: 1rem
- 2xl: 1.5rem
- full: 9999px

---

## 📦 Complete Project Structure

```
packages/user-app/
├── public/
│   └── vite.svg
├── src/
│   ├── api/                          # ✅ COMPLETE - API Layer
│   │   ├── client.ts                # Axios client with interceptors
│   │   ├── restaurant.api.ts        # Restaurant endpoints
│   │   ├── categories.api.ts        # Categories endpoints
│   │   ├── menu.api.ts              # Menu endpoints
│   │   ├── tables.api.ts            # Tables endpoints
│   │   ├── orders.api.ts            # Orders endpoints
│   │   └── index.ts                 # API exports
│   │
│   ├── components/                   # ✅ COMPLETE - UI Components
│   │   ├── ui/                      # Base UI components
│   │   │   ├── Button.tsx           # Button with variants
│   │   │   ├── Card.tsx             # Card with sections
│   │   │   ├── Badge.tsx            # Badge component
│   │   │   ├── Input.tsx            # Input with validation
│   │   │   ├── TextArea.tsx         # TextArea component
│   │   │   ├── Spinner.tsx          # Loading spinner
│   │   │   ├── Modal.tsx            # Modal dialog
│   │   │   └── index.ts             # UI exports
│   │   ├── Header.tsx               # App header
│   │   ├── MenuItem.tsx             # Menu item card
│   │   ├── CategoryFilter.tsx       # Category filter
│   │   ├── OrderStatusBadge.tsx     # Status badge
│   │   ├── Loading.tsx              # Loading screen
│   │   ├── ErrorMessage.tsx         # Error display
│   │   └── index.ts                 # Component exports
│   │
│   ├── constants/                    # ✅ COMPLETE - Constants
│   │   └── index.ts                 # App configuration
│   │
│   ├── context/                      # ✅ COMPLETE - Context Providers
│   │   ├── RestaurantContext.tsx    # Restaurant state
│   │   ├── CartContext.tsx          # Cart state
│   │   └── SocketContext.tsx        # Socket connection
│   │
│   ├── hooks/                        # ✅ COMPLETE - Custom Hooks
│   │   ├── useCategories.ts         # Categories hook
│   │   ├── useMenu.ts               # Menu hook
│   │   ├── useTables.ts             # Tables hook
│   │   ├── useOrder.ts              # Order hook
│   │   ├── usePlaceOrder.ts         # Place order hook
│   │   ├── useDebounce.ts           # Debounce hook
│   │   └── index.ts                 # Hook exports
│   │
│   ├── pages/                        # ✅ UPDATED - Page Components
│   │   ├── TableSelection.tsx       # ✅ COMPLETE - Beautiful hero + grid
│   │   ├── Menu.tsx                 # ⚡ UPDATE WITH NEW UI
│   │   ├── Cart.tsx                 # ⚡ UPDATE WITH NEW UI
│   │   └── OrderTracking.tsx        # ⚡ UPDATE WITH NEW UI
│   │
│   ├── services/                     # ✅ COMPLETE - Services
│   │   └── socket.ts                # Socket.io service
│   │
│   ├── types/                        # ✅ COMPLETE - TypeScript Types
│   │   └── index.ts                 # All interfaces
│   │
│   ├── utils/                        # ✅ COMPLETE - Utilities
│   │   ├── subdomain.ts             # Subdomain detection
│   │   ├── format.ts                # Formatting utils
│   │   ├── validation.ts            # Validation utils
│   │   └── index.ts                 # Utility exports
│   │
│   ├── App.tsx                       # ✅ COMPLETE - Main app
│   ├── main.tsx                      # ✅ COMPLETE - Entry point
│   └── index.css                     # ✅ Global styles
│
├── .env.example                      # ✅ COMPLETE
├── .eslintrc.cjs
├── .gitignore
├── index.html
├── package.json                      # ✅ COMPLETE
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── README.md                         # ✅ COMPLETE
├── ARCHITECTURE.md                   # ✅ COMPLETE
└── SETUP_GUIDE.md                   # ✅ THIS FILE
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd packages/user-app
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Configure Hosts (For Subdomain Testing)
Add to `/etc/hosts`:
```
127.0.0.1 pizzahut.localhost
127.0.0.1 burgerking.localhost
127.0.0.1 tacobell.localhost
```

### 4. Start Backend
```bash
cd packages/backend
npm run dev
```

### 5. Seed Demo Data
```bash
cd packages/backend
npm run seed:multi
```

### 6. Start Frontend
```bash
cd packages/user-app
npm run dev
```

### 7. Access App
- Pizza Hut: `http://pizzahut.localhost:5173`
- Burger King: `http://burgerking.localhost:5173`
- Taco Bell: `http://tacobell.localhost:5173`

---

## 🎨 UI Components Usage

### Button Component
```tsx
import { Button } from './components/ui';

// Primary button
<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>

// Loading button
<Button isLoading={loading} variant="primary">
  Processing...
</Button>

// Full width
<Button fullWidth variant="primary">
  Submit
</Button>
```

### Card Component
```tsx
import Card, { CardHeader, CardBody, CardFooter } from './components/ui/Card';

<Card hover onClick={handleClick}>
  <CardHeader>
    <h3>Title</h3>
  </CardHeader>
  <CardBody>
    <p>Content goes here</p>
  </CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Badge Component
```tsx
import { Badge } from './components/ui';

<Badge variant="success" size="md">Active</Badge>
<Badge variant="danger" size="sm">Inactive</Badge>
<Badge variant="warning">Pending</Badge>
```

### Input Component
```tsx
import { Input } from './components/ui';
import { Search } from 'lucide-react';

<Input
  label="Search"
  placeholder="Search menu items..."
  leftIcon={<Search />}
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  error={error}
  helperText="Min 2 characters"
/>
```

### Modal Component
```tsx
import Modal, { ModalBody, ModalFooter } from './components/ui/Modal';

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Item Details"
  size="lg"
>
  <ModalBody>
    <p>Modal content</p>
  </ModalBody>
  <ModalFooter>
    <Button variant="secondary" onClick={handleClose}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleSave}>
      Save
    </Button>
  </ModalFooter>
</Modal>
```

---

## 🎯 Page Implementations

### TableSelection Page
**Status**: ✅ COMPLETE

**Features**:
- Beautiful hero section with gradient background
- Restaurant logo and branding
- Grid layout for tables
- Visual feedback for selection
- Occupied/available status
- How-it-works section

**Design Elements**:
- Wave divider SVG
- Hover animations
- Selection rings
- Gradient cards
- Badge overlays

### Menu Page
**Status**: ⚡ NEEDS UI UPDATE

**Required Features**:
- Header with search bar
- Category filter (sticky)
- Menu items grid
- Item detail modal with customizations
- Add to cart functionality
- Real-time available quantity

**Design Elements**:
- Search with icon
- Animated category pills
- Beautiful menu cards with images
- Modal with customization options
- Quantity selector
- Price calculator

### Cart Page
**Status**: ⚡ NEEDS UI UPDATE

**Required Features**:
- Cart items list with editing
- Order summary sidebar
- Order notes textarea
- Place order button
- Empty cart state
- Loading states

**Design Elements**:
- Item cards with quantity controls
- Sticky order summary
- Price breakdown
- Beautiful empty state
- Success animations

### OrderTracking Page
**Status**: ⚡ NEEDS UI UPDATE

**Required Features**:
- Order header with status badge
- Real-time status timeline
- Order items list
- Price summary
- Live connection indicator
- Action buttons

**Design Elements**:
- Animated timeline
- Status progress indicator
- Real-time badge updates
- Beautiful status icons
- Smooth transitions

---

## 🔄 State Management Flow

### 1. Restaurant Context
```
App Mount
  → extractSubdomain()
  → fetch restaurant info
  → apply branding
  → store restaurantId
```

### 2. Socket Context
```
Restaurant loaded
  → connect to namespace
  → join table room
  → listen for events
```

### 3. Cart Context
```
Add item
  → validate
  → add to cart
  → save to localStorage
  → update UI
```

### 4. Order Flow
```
Place Order
  → validate cart
  → create order via API
  → clear cart
  → navigate to tracking
  → socket joins order room
  → receive real-time updates
```

---

## 🎨 Design Patterns

### 1. Color Contrast
- Always ensure 4.5:1 contrast ratio
- Use `primaryColor` for CTAs
- Use semantic colors (green = success, red = error)
- White text on colored backgrounds
- Dark text on light backgrounds

### 2. Visual Hierarchy
- Larger font sizes for headers
- Bold weights for important text
- Spacing to separate sections
- Cards to group related content
- Shadows for depth

### 3. Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly tap targets (min 44x44px)
- Readable line lengths (45-75 characters)
- Adequate spacing for fingers

### 4. Animations
- 200ms for quick interactions (hover)
- 300ms for medium transitions (modals)
- 500ms for slow animations (page transitions)
- Use `ease-in-out` for natural feel
- Animate transform and opacity (GPU accelerated)

---

## 🧪 Testing Checklist

### Functional Testing
- [ ] Table selection works
- [ ] Menu loads with correct items
- [ ] Search filters menu
- [ ] Category filter works
- [ ] Add to cart works
- [ ] Customizations save correctly
- [ ] Cart updates quantities
- [ ] Order placement succeeds
- [ ] Order tracking shows real-time updates
- [ ] Socket connection works

### UI Testing
- [ ] All colors have sufficient contrast
- [ ] Buttons are touch-friendly
- [ ] Text is readable at all sizes
- [ ] Images load correctly
- [ ] Icons display properly
- [ ] Animations are smooth
- [ ] No layout shifts
- [ ] Responsive on mobile/tablet/desktop

### Multi-Tenant Testing
- [ ] Subdomain detection works
- [ ] Restaurant branding applies
- [ ] API calls include correct headers
- [ ] Socket connects to correct namespace
- [ ] Data is isolated per restaurant

---

## 📱 Mobile Optimizations

### Touch Targets
- Minimum size: 44x44px
- Adequate spacing between buttons
- Large tap areas for important actions

### Performance
- Lazy load images
- Code splitting by route
- Minimize bundle size
- Cache API responses
- Optimize images

### UX
- Bottom navigation for key actions
- Swipe gestures where appropriate
- Loading indicators for all actions
- Offline-friendly where possible
- Pull to refresh

---

## 🎯 Key Features Summary

### ✅ Implemented
1. Multi-tenant architecture
2. Subdomain routing
3. Dynamic branding
4. API layer with interceptors
5. Socket.io namespace isolation
6. Custom hooks for data fetching
7. Reusable UI components
8. Context providers for global state
9. TypeScript throughout
10. Beautiful Table Selection page

### ⚡ Ready to Implement
1. Enhanced Menu page with modal
2. Beautiful Cart page
3. Real-time Order Tracking page

---

## 🚀 Deployment

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

### Environment Variables (Production)
```env
VITE_API_URL=https://api.patlinks.com
VITE_SOCKET_URL=https://api.patlinks.com
VITE_API_DOMAIN=patlinks.com
```

### Hosting
- **Vercel** (Recommended): Zero-config, auto subdomain
- **Netlify**: Configure wildcard subdomain
- **AWS S3 + CloudFront**: Manual subdomain setup

---

## 📚 Additional Resources

- **API Documentation**: `packages/backend/API_DOCUMENTATION.md`
- **Backend README**: `packages/backend/README.md`
- **Architecture Guide**: `packages/user-app/ARCHITECTURE.md`

---

## 🆘 Troubleshooting

### Issue: "Restaurant Not Found"
**Solution**:
- Check subdomain spelling
- Verify backend is running
- Ensure restaurant exists in database
- Check browser console for errors

### Issue: Socket not connecting
**Solution**:
- Verify `VITE_SOCKET_URL` is correct
- Check backend Socket.io server is running
- Look for CORS errors in console
- Verify namespace format `/restaurant/{id}`

### Issue: Branding not applying
**Solution**:
- Check restaurant has branding object in DB
- Verify CSS variables are set in RestaurantContext
- Inspect element to see computed styles
- Clear browser cache

### Issue: Cart not persisting
**Solution**:
- Check localStorage is enabled
- Verify cart key matches constant
- Clear localStorage and retry
- Check browser privacy settings

---

## 💡 Pro Tips

1. **Use Chrome DevTools** for responsive testing
2. **Enable React DevTools** for component debugging
3. **Use Network tab** to monitor API calls
4. **Check Application tab** for localStorage/cookies
5. **Use Lighthouse** for performance audits
6. **Test on real devices** before deployment
7. **Use error boundaries** to catch React errors
8. **Log important events** for debugging
9. **Use TypeScript strictly** for type safety
10. **Follow component naming conventions**

---

**Built with ❤️ for Patlinks Platform**

*Last Updated: 2024-01-08*
*Version: 1.0.0*
