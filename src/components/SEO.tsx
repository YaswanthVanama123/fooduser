import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useRestaurant } from '../context/RestaurantContext';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
}) => {
  const { restaurant } = useRestaurant();

  // Generate dynamic title and description based on restaurant
  const restaurantName = restaurant?.name || 'Restaurant';
  const defaultTitle = `${restaurantName} - Order Online`;
  const defaultDescription = `Order delicious food online from ${restaurantName}. Browse our menu, place orders, and track your food in real-time.`;
  const defaultKeywords = [
    'restaurant',
    'food ordering',
    'online menu',
    'delivery',
    'takeout',
    restaurantName,
  ];

  const siteTitle = title ? `${title} | ${restaurantName}` : defaultTitle;
  const siteDescription = description || defaultDescription;
  const siteKeywords = [...defaultKeywords, ...keywords].join(', ');
  const siteImage = image || restaurant?.branding?.logo || '';
  const siteUrl = url || window.location.href;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={siteKeywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      {siteImage && <meta property="og:image" content={siteImage} />}
      <meta property="og:site_name" content={restaurantName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={siteUrl} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={siteDescription} />
      {siteImage && <meta name="twitter:image" content={siteImage} />}

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content={restaurant?.branding?.primaryColor || '#6366f1'} />
      <link rel="canonical" href={siteUrl} />

      {/* Restaurant-specific Schema.org structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Restaurant',
          name: restaurantName,
          description: siteDescription,
          image: siteImage,
          url: siteUrl,
          ...(restaurant?.address && {
            address: {
              '@type': 'PostalAddress',
              streetAddress: restaurant.address.street,
              addressLocality: restaurant.address.city,
              addressRegion: restaurant.address.state,
              postalCode: restaurant.address.zipCode,
              addressCountry: restaurant.address.country,
            },
          }),
          ...(restaurant?.phone && { telephone: restaurant.phone }),
          ...(restaurant?.email && { email: restaurant.email }),
          servesCuisine: keywords.length > 0 ? keywords : undefined,
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
