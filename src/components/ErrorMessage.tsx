import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import Button from './ui/Button';
import Card, { CardBody } from './ui/Card';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Oops! Something went wrong',
  message,
  onRetry,
  fullScreen = true,
}) => {
  const content = (
    <Card className="max-w-md w-full">
      <CardBody className="text-center py-12">
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="h-10 w-10 text-red-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>

        {onRetry && (
          <Button
            onClick={onRetry}
            variant="primary"
            size="lg"
            className="space-x-2"
          >
            <RefreshCcw className="h-5 w-5" />
            <span>Try Again</span>
          </Button>
        )}
      </CardBody>
    </Card>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-4">{content}</div>;
};

export default ErrorMessage;
