import { useState, useRef, useEffect } from "react";

interface CustomSelectProps {
  label: string;
  options: string[];
  selectedOption: string;
  onChange: (option: string) => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ label, options, selectedOption, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectRef]);

  return (
    <div className="relative" ref={selectRef}>
      <label className="font-semibold">{label}</label>
      <div
        className="mt-2 p-2 border rounded-md bg-light-background dark:bg-dark-background hover:border-light-secondary dark:hover:border-dark-secondary focus:ring-2 focus:ring-light-secondary dark:focus:ring-dark-secondary cursor-pointer text-light-foreground dark:text-dark-foreground"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption}
      </div>
      {isOpen && (
        <ul className="absolute z-10 mt-1 w-full bg-light-background dark:bg-dark-background border border-light-secondary dark:border-dark-secondary rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <li
              key={option}
              className="px-4 py-2 hover:bg-light-secondary dark:hover:bg-dark-secondary hover:cursor-pointer text-light-foreground dark:text-dark-foreground hover:text-dark-background dark:hover:text-dark-background"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
