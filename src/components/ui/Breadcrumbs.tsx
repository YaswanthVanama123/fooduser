import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  const location = useLocation();

  // Generate breadcrumbs from current path if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;

    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', path: '/' }];

    const pathMap: { [key: string]: string } = {
      menu: 'Menu',
      cart: 'Cart',
      order: 'Order',
      profile: 'Profile',
      'order-history': 'Order History',
      favorites: 'Favorites',
      settings: 'Settings',
      'change-password': 'Change Password',
      login: 'Login',
      register: 'Register',
    };

    pathnames.forEach((pathname, index) => {
      const path = `/${pathnames.slice(0, index + 1).join('/')}`;
      const label = pathMap[pathname] || pathname;
      breadcrumbs.push({ label, path });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav
      className={`flex items-center space-x-2 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      {breadcrumbs.map((breadcrumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const isFirst = index === 0;

        return (
          <React.Fragment key={breadcrumb.path}>
            {isLast ? (
              <span className="flex items-center text-gray-900 font-medium">
                {isFirst && <Home className="h-4 w-4 mr-1" />}
                {breadcrumb.label}
              </span>
            ) : (
              <>
                <Link
                  to={breadcrumb.path}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {isFirst && <Home className="h-4 w-4 mr-1" />}
                  {breadcrumb.label}
                </Link>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
