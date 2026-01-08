# Public Folder - Static Assets

This folder contains all static assets that are served directly without processing by the build system. Files in this folder are publicly accessible and can be referenced in your HTML file.

## Folder Structure

```
public/
├── index.html                          # Main HTML template
├── manifest.json                       # PWA manifest for installable app
├── robots.txt                          # SEO robots file
├── favicon.ico                         # Browser favicon (needs to be created)
├── favicon-instructions.txt            # Instructions for creating favicon
└── images/                             # Image assets folder
    ├── placeholder-food.png            # Placeholder for menu items (needs actual image)
    ├── placeholder-restaurant.png      # Placeholder for restaurant logos (needs actual image)
    ├── logo-192x192.png                # PWA icon - 192x192px (needs actual image)
    ├── logo-512x512.png                # PWA icon - 512x512px (needs actual image)
    ├── empty-cart.svg                  # Empty cart illustration (ready to use)
    ├── empty-favorites.svg             # Empty favorites illustration (ready to use)
    └── empty-orders.svg                # Empty orders illustration (ready to use)
```

## Files Description

### 1. index.html
The main HTML template for the React app. Contains:
- Meta tags for SEO and social sharing
- Favicon and manifest links
- Theme color configuration
- Open Graph and Twitter card metadata

**Customization:**
- Update `<title>` tag with your app name
- Modify meta descriptions for better SEO
- Update theme-color to match your brand

### 2. manifest.json
PWA (Progressive Web App) manifest that enables:
- Add to home screen functionality
- Standalone app experience
- Custom splash screen
- App icon configuration

**Customization:**
- Update `name` and `short_name` with your app name
- Modify `theme_color` and `background_color` to match branding
- Ensure icon paths are correct after adding actual images

### 3. robots.txt
Controls search engine crawler access:
- Allows all crawlers by default
- Blocks sensitive endpoints (/api/, /admin/)
- Points to sitemap location

**Customization:**
- Update sitemap URL when available
- Add more Disallow rules for restricted areas

### 4. Images Folder

#### SVG Illustrations (Ready to Use)
- **empty-cart.svg**: Shopping cart with empty state message
- **empty-favorites.svg**: Heart icon with empty state message
- **empty-orders.svg**: Receipt/clipboard with empty state message

These are custom-created SVG illustrations that can be used directly in your React components.

#### Image Files (Need Creation)
The following files need actual images:

**favicon.ico**
- Browser tab icon
- See `favicon-instructions.txt` for creation steps

**placeholder-food.png**
- Fallback image for menu items without photos
- Recommended size: 600x400px or 800x600px
- Format: PNG with transparency

**placeholder-restaurant.png**
- Fallback image for restaurant logos
- Recommended size: 400x400px (square)
- Format: PNG with transparency

**logo-192x192.png** & **logo-512x512.png**
- PWA app icons for different screen sizes
- Must follow PWA guidelines (safe zone, padding)
- Format: PNG with transparency or solid background

## How to Add/Update Assets

### Adding Images

1. Place image files in the `/public/images/` folder
2. Reference them in React components:
   ```jsx
   <img src="/images/logo-192x192.png" alt="Logo" />
   ```
   Or using `process.env.PUBLIC_URL`:
   ```jsx
   <img src={`${process.env.PUBLIC_URL}/images/logo-192x192.png`} alt="Logo" />
   ```

### Using SVG Illustrations

Import and use the SVG files directly:
```jsx
<img src="/images/empty-cart.svg" alt="Empty cart" />
```

Or as background images in CSS:
```css
.empty-state {
  background-image: url('/images/empty-cart.svg');
  background-size: contain;
  background-repeat: no-repeat;
}
```

### Updating Favicons

1. Follow instructions in `favicon-instructions.txt`
2. Generate favicon using online tools or design software
3. Replace `favicon.ico` in this folder
4. Update PWA icons (`logo-192x192.png` and `logo-512x512.png`)

### Updating Manifest

Edit `manifest.json` to change:
- App name and description
- Theme colors
- Icon paths
- Display mode (standalone, fullscreen, minimal-ui)

## Where to Get Free Images and Icons

### Stock Photos (for placeholders)
- **Unsplash**: https://unsplash.com/ (Free high-quality photos)
- **Pexels**: https://www.pexels.com/ (Free stock photos)
- **Pixabay**: https://pixabay.com/ (Free images and vectors)

### Illustrations
- **unDraw**: https://undraw.co/ (Customizable illustrations)
- **Storyset**: https://storyset.com/ (Animated illustrations)
- **DrawKit**: https://www.drawkit.io/ (Hand-drawn illustrations)

### Icons
- **Heroicons**: https://heroicons.com/ (Beautiful SVG icons)
- **Lucide**: https://lucide.dev/ (Icon library)
- **Flaticon**: https://www.flaticon.com/ (Icon library)
- **Font Awesome**: https://fontawesome.com/ (Icon toolkit)

### Favicon Generators
- **RealFaviconGenerator**: https://realfavicongenerator.net/
- **Favicon.io**: https://favicon.io/
- **Icon Kitchen**: https://icon.kitchen/

### PWA Tools
- **PWA Builder**: https://www.pwabuilder.com/ (PWA resources)
- **Maskable.app**: https://maskable.app/ (Test PWA icons)
- **PWA Asset Generator**: https://github.com/onderceylan/pwa-asset-generator

## Best Practices

1. **Image Optimization**
   - Compress images before adding (use TinyPNG, ImageOptim)
   - Use appropriate formats (WebP for photos, SVG for illustrations)
   - Keep file sizes small for faster loading

2. **Naming Conventions**
   - Use lowercase and hyphens (kebab-case)
   - Be descriptive: `empty-cart.svg` not `img1.svg`
   - Include size in filename for multiple versions: `logo-192x192.png`

3. **Accessibility**
   - Always provide alt text when using images
   - Ensure sufficient color contrast
   - Test images with screen readers

4. **PWA Guidelines**
   - Use square images for PWA icons
   - Include safe zone padding (10-20%)
   - Test on various devices and screen sizes
   - Ensure icons work with both light and dark themes

5. **Version Control**
   - Commit SVG and small images to Git
   - Consider using Git LFS for large binary files
   - Document any external CDN usage

## Testing Assets

### Before Deploying:
1. Check all image paths are correct
2. Test favicon in different browsers
3. Test PWA installation on mobile devices
4. Verify meta tags with social media debuggers:
   - Facebook: https://developers.facebook.com/tools/debug/
   - Twitter: https://cards-dev.twitter.com/validator
   - LinkedIn: https://www.linkedin.com/post-inspector/

### Performance:
- Run Lighthouse audit in Chrome DevTools
- Check image loading times
- Verify proper caching headers

## Need Help?

- React documentation: https://react.dev/learn
- PWA documentation: https://web.dev/progressive-web-apps/
- Web.dev best practices: https://web.dev/

---

**Note**: Some image files (PNG/ICO) are currently placeholder files with instructions. Replace them with actual images before deploying to production.
