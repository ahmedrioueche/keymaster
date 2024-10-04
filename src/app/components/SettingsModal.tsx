import React, { useState, useEffect, useRef } from 'react';
import { FaSpinner, FaTimes } from 'react-icons/fa';
import { Settings, User } from "../types/types";
import Image from 'next/image';
import { apiSetSettings } from '../utils/apiHelper';
import { defaultTextLength, minTextLength } from '../utils/settings';
import { useUser } from '../context/UserContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser } = useUser(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState<"save" | "null">("null");

  const languages = ["English", "French", "Spanish"];
  const typingModes = ["Auto", "Manual"];
  const difficultyLevels = ["Beginner", "Intermediate", "Advanced"];
  const soundEffects = ["Enabled", "Disabled"];
  
  // Initialize user settings or fallback to default values
  const [language, setLanguage] = useState<string>(currentUser?.settings?.language || languages[0]);
  const [typingMode, setTypingMode] = useState<string>(currentUser?.settings?.mode === 'manual' ? "Manual" : "Auto");
  const [textLength, setTextLength] = useState<number>(currentUser?.settings?.textLength || defaultTextLength);
  const [isValidTextLength, setIsValidTextLength] = useState<boolean>(true);
  const [difficultyLevel, setDifficultyLevel] = useState<string>(currentUser?.settings?.difficultyLevel || difficultyLevels[0]);
  const [soundEffect, setSoundEffect] = useState<string>(currentUser?.settings?.soundEffects ? "Enabled" : "Disabled");

  const handleSave = async () => {
    if (!isValidTextLength) return;

    setIsLoading("save");

    const settings: Settings = {
      language: language.toLowerCase(), // Set language to lowercase
      mode: typingMode === "Auto" ? 'auto' : 'manual',
      textLength,
      soundEffects: soundEffect === "Enabled",
      difficultyLevel: difficultyLevel.toLowerCase() as 'beginner' | 'intermediate' | 'advanced',
    };

    console.log("currentUser", currentUser);

    // Call your API to save settings
    const response = currentUser?.id ? await apiSetSettings(currentUser.id, settings) : null;
    console.log("response", response);

    if(currentUser){
      const updatedUser : User = {
        ...currentUser,
        settings : settings,
      }
      setCurrentUser(updatedUser);
    }
  
    setIsLoading("null");
    onClose();
  };

  const handleTextLengthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setTextLength(value);
    setIsValidTextLength(value >= minTextLength); // Validate input to be greater than minTextLength
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-transform duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
    >
      <div className="bg-light-background dark:bg-dark-background rounded-lg shadow-lg p-5 w-full sm:w-[90%] max-w-3xl max-h-[99vh] overflow-y-auto hide-scrollbar">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center text-light-foreground dark:text-dark-foreground">
            <Image src='/icons/settings.png' height={30} width={30} className="text-3xl mr-3" alt="Settings" />
            <h2 className="text-xl font-bold mt-1 font-dancing">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-light-background hover:bg-light-secondary dark:bg-dark-background dark:hover:bg-dark-secondary transition-colors duration-300 text-light-foreground dark:text-dark-foreground"
          >
            <FaTimes size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 flex justify-center">
            <Image 
              src="/storysets/settings.svg" 
              alt="Settings illustration" 
              className="object-contain w-1/2 md:w-3/4 lg:w-full h-auto"
              height={48} 
              width={38} 
            />
          </div>

          <div className="col-span-2 space-y-4 text-light-foreground dark:text-dark-foreground">
            <CustomSelect label="Language" options={languages} selectedOption={language} onChange={setLanguage} />
            <CustomSelect label="Typing Mode" options={typingModes} selectedOption={typingMode} onChange={setTypingMode} />
            <div className='flex flex-col'>
              <label className="font-semibold">Text length</label>
              <input 
                className="mt-2 p-2 border rounded-md bg-light-background dark:bg-dark-background text-light-foreground dark:text-dark-foreground hover:border-light-secondary dark:hover:border-dark-secondary focus:ring-2 focus:ring-light-secondary dark:focus:ring-dark-secondary transition-colors duration-300 no-spinner"
                type='number' 
                value={textLength} 
                onChange={handleTextLengthChange}
              />
              {!isValidTextLength && (
                <span className="text-dark-secondary text-base mt-1">Text length must be equal to or greater than {minTextLength} letters.</span>
              )}
            </div>
            <CustomSelect label="Difficulty Level" options={difficultyLevels} selectedOption={difficultyLevel} onChange={setDifficultyLevel} />
            <CustomSelect label="Sound Effects" options={soundEffects} selectedOption={soundEffect} onChange={setSoundEffect} />

            <div className="flex justify-end">
              <button
                type="button"
                className="flex w-40 justify-center flex-1 px-4 py-3 mt-4 bg-light-secondary text-dark-background rounded-md font-semibold hover:text-light-background hover:bg-light-accent dark:hover:bg-dark-accent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-light-secondary dark:ring-dark-secondary focus:ring-offset-2"
                onClick={handleSave}
              >
                {isLoading === "save" ? <FaSpinner className="animate-spin" /> : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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

export default SettingsModal;
