import React from 'react';
import { Heart } from 'lucide-react';

interface TipSelectionProps {
  subtotal: number;
  selectedTip: number;
  onTipChange: (tip: number) => void;
  primaryColor: string;
}

const TipSelection: React.FC<TipSelectionProps> = ({
  subtotal,
  selectedTip,
  onTipChange,
  primaryColor,
}) => {
  const tipOptions = [
    { label: '10%', value: subtotal * 0.1 },
    { label: '15%', value: subtotal * 0.15 },
    { label: '20%', value: subtotal * 0.2 },
    { label: 'Custom', value: -1 },
  ];

  const [showCustomInput, setShowCustomInput] = React.useState(false);
  const [customTipInput, setCustomTipInput] = React.useState('');

  const handleTipOptionClick = (value: number, label: string) => {
    if (label === 'Custom') {
      setShowCustomInput(true);
      setCustomTipInput(selectedTip.toFixed(2));
    } else {
      setShowCustomInput(false);
      onTipChange(value);
    }
  };

  const handleCustomTipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomTipInput(value);
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue >= 0) {
      onTipChange(numericValue);
    }
  };

  const handleNoTip = () => {
    setShowCustomInput(false);
    setCustomTipInput('');
    onTipChange(0);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Heart className="h-5 w-5 mr-2" style={{ color: primaryColor }} />
          <span className="font-semibold text-gray-900">Add a Tip</span>
        </div>
        <button
          onClick={handleNoTip}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          No Tip
        </button>
      </div>

      {!showCustomInput ? (
        <div className="grid grid-cols-4 gap-2">
          {tipOptions.map((option) => {
            const isSelected =
              option.label === 'Custom'
                ? false
                : Math.abs(selectedTip - option.value) < 0.01;

            return (
              <button
                key={option.label}
                onClick={() => handleTipOptionClick(option.value, option.label)}
                className={`py-2.5 px-3 rounded-lg font-semibold text-sm transition-all ${
                  isSelected
                    ? 'text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: primaryColor,
                      }
                    : {}
                }
              >
                {option.label}
                {option.value !== -1 && (
                  <div className="text-xs mt-0.5 opacity-90">
                    ${option.value.toFixed(2)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 font-medium">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={customTipInput}
              onChange={handleCustomTipChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{
                focusRingColor: primaryColor,
              }}
              placeholder="Enter custom tip amount"
              autoFocus
            />
          </div>
          <button
            onClick={() => {
              setShowCustomInput(false);
              if (!customTipInput || parseFloat(customTipInput) === 0) {
                onTipChange(0);
              }
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to options
          </button>
        </div>
      )}

      {selectedTip > 0 && !showCustomInput && (
        <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
          <span className="text-gray-600">Tip Amount</span>
          <span className="font-semibold" style={{ color: primaryColor }}>
            ${selectedTip.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
};

export default TipSelection;
