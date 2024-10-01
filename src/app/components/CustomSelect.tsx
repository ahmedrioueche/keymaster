// CustomSelect.tsx
import React, { useState } from 'react';

interface CustomSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  isDarkMode: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div
        onClick={toggleDropdown}
        className={`w-full p-1 text-sm rounded cursor-pointer ${
          isDarkMode ? 'bg-dark-background' : 'bg-light-background'
        }`}
      >
        {options.find((option) => option.value === value)?.label || 'Select an option'}
      </div>
      {isOpen && (
        <div className={`absolute z-10 mt-1 rounded shadow-lg ${isDarkMode ? 'bg-dark-secondary' : 'bg-light-secondary'}`}>
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              className={`p-2 text-sm cursor-pointer hover:bg-${isDarkMode ? 'dark-secondary' : 'light-secondary'}`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
