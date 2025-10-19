import React from 'react';
import { Clock, Package, Truck, CheckCircle, XCircle } from 'lucide-react';

interface OrderStatusTrackerProps {
  status: string;
  createdAt: string;
}

export const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ status, createdAt }) => {
  const steps = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle },
  ];

  const getCurrentStepIndex = () => {
    if (!status || status === 'cancelled') return -1;
    return steps.findIndex(step => step.key === status);
  };

  const currentStepIndex = getCurrentStepIndex();

  if (!status) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
        <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <span className="font-medium text-gray-800 dark:text-gray-200">Status Unknown</span>
      </div>
    );
  }

  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
        <span className="font-medium text-red-800 dark:text-red-200">Order Cancelled</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm text-muted-foreground">Order Progress</h4>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          
          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors
                ${isCompleted 
                  ? 'bg-primary border-primary text-primary-foreground' 
                  : 'border-muted-foreground/30 text-muted-foreground'
                }
                ${isCurrent ? 'ring-2 ring-primary/20' : ''}
              `}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={`
                text-xs mt-2 text-center font-medium
                ${isCompleted ? 'text-primary' : 'text-muted-foreground'}
              `}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className={`
                  absolute h-0.5 w-full top-4 left-1/2 transform -translate-y-1/2 -z-10
                  ${index < currentStepIndex ? 'bg-primary' : 'bg-muted-foreground/20'}
                `} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};