import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';

interface InvalidUrlErrorProps {
  error: Error;
}

const InvalidUrlError: React.FC<InvalidUrlErrorProps> = ({ error }) => {
  const currentUrl = window.location.href;
  const hostname = window.location.hostname;

  // Generate correct URL suggestion
  const getSuggestedUrl = () => {
    // If accessing user app with "admin" prefix
    if (error.message.includes('admin') && hostname.startsWith('admin.')) {
      // Remove "admin." prefix and change port to 5174
      return currentUrl.replace(/\/\/admin\./, '//').replace(':5175', ':5174');
    }
    return null;
  };

  const suggestedUrl = getSuggestedUrl();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Invalid URL
        </h1>

        <p className="text-gray-600 text-center mb-6">
          {error.message}
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Current URL:</p>
          <code className="text-xs text-red-600 break-all block bg-white p-2 rounded border border-red-200">
            {currentUrl}
          </code>
        </div>

        {suggestedUrl && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Try this instead:</p>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <code className="text-xs text-green-700 break-all block">
                {suggestedUrl}
              </code>
            </div>
            <button
              onClick={() => window.location.href = suggestedUrl}
              className="mt-3 w-full flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Go to Correct URL
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        )}

        <div className="border-t pt-6">
          <p className="text-sm font-semibold text-gray-900 mb-3">Correct URL Format:</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <div>
                <p className="font-medium text-gray-900">User App:</p>
                <code className="text-xs text-gray-600">{'{restaurant}'}.localhost:5174</code>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <div>
                <p className="font-medium text-gray-900">Admin App:</p>
                <code className="text-xs text-gray-600">admin.{'{restaurant}'}.localhost:5175</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvalidUrlError;
