import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder: string;
  icon?: React.ReactNode;
}

export default function FilterDropdown({
  value,
  onChange,
  options,
  placeholder,
  icon,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 pl-3.5 pr-3 py-2 rounded-full text-sm font-medium transition-all ${
          value
            ? 'bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100'
            : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        {icon && <span className="text-gray-400">{icon}</span>}
        <span>{selectedOption?.label || placeholder}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-56 origin-top-left">
          <div className="bg-white rounded-xl shadow-xl ring-1 ring-black/5 overflow-hidden">
            {/* Header */}
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                {placeholder}
              </p>
            </div>

            {/* Options */}
            <div className="py-1 max-h-64 overflow-y-auto">
              {/* Reset option */}
              <button
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                  !value
                    ? 'bg-gray-50 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  !value ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                }`}>
                  {!value && (
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="text-sm">Tous</span>
              </button>

              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                    value === option.value
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    value === option.value ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                  }`}>
                    {value === option.value && (
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
