import React from 'react';
import { OrderStatus } from '../types';
import { Clock, ChefHat, CheckCircle, Truck, XCircle } from 'lucide-react';
import Badge from './ui/Badge';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return {
          variant: 'info' as const,
          label: 'Order Received',
          icon: Clock,
          description: 'Your order has been received',
        };
      case 'preparing':
        return {
          variant: 'warning' as const,
          label: 'Preparing',
          icon: ChefHat,
          description: 'Chef is preparing your meal',
        };
      case 'ready':
        return {
          variant: 'success' as const,
          label: 'Ready',
          icon: CheckCircle,
          description: 'Your order is ready!',
        };
      case 'served':
        return {
          variant: 'success' as const,
          label: 'Served',
          icon: Truck,
          description: 'Order served, enjoy!',
        };
      case 'cancelled':
        return {
          variant: 'danger' as const,
          label: 'Cancelled',
          icon: XCircle,
          description: 'Order was cancelled',
        };
      default:
        return {
          variant: 'gray' as const,
          label: status,
          icon: Clock,
          description: 'Processing...',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} size={size} className="inline-flex items-center space-x-2">
      <Icon className="h-4 w-4" />
      <span>{config.label}</span>
    </Badge>
  );
};

export default OrderStatusBadge;
