import React, { useState } from 'react';
import { SearchPrefs } from '../services/types/types';
import { FaTimes } from 'react-icons/fa';
import Image from 'next/image';
import CustomSelect from './CustomSelect';
import { languages } from '../utils/text';
import { maxTextLength, minTextLength } from '../utils/settings';

interface CustomizeSearchProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (prefs: SearchPrefs) => void;
}

const CustomizeSearch: React.FC<CustomizeSearchProps> = ({ isOpen, onClose, onSave }) => {    
    const [language, setLanguage] = useState<string>(languages[0]);
    const [textLength, settextLength] = useState<number>(100); // Default value
    const [isValidTextLength, setIsValidTextLength] = useState<boolean>(true);

    // Handle saving preferences
    const handleSave = () => {
        const prefs: SearchPrefs = {
            prefLanguage: language.toLowerCase(),
            prefTextMaxLength: textLength,
        };
        onSave(prefs);
    };

    const handleTextLengthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value);
        settextLength(value);
        setIsValidTextLength(value >= minTextLength && value <= maxTextLength);
    };

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-transform duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
            <div className="bg-light-background dark:bg-dark-background text-dark-background dark:text-light-background rounded-lg shadow-lg p-5 w-full sm:w-[90%] max-w-md max-h-[95vh] overflow-y-auto hide-scrollbar">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex-grow flex justify-center">
                        <h1 className="text-3xl font-bold mb-4 mt-1 text-light-primary dark:text-dark-primary">
                            Customize Search
                        </h1>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-light-background hover:bg-light-accent dark:hover:bg-dark-secondary transition-colors duration-300 text-gray-700"
                    >
                        <FaTimes size={16} />
                    </button>
                </div>
                <div className="flex justify-center mb-4">
                    <Image src="/storysets/customize_search.svg" alt="Search preferences illustration" className="w-full h-48 object-contain" height={48} width={38} />
                </div>

                {/* Language Selector */}
                <div className="mb-4">
                    <CustomSelect 
                        label="Select Language" 
                        options={languages} 
                        selectedOption={language} 
                        onChange={setLanguage} 
                    />
                </div>

                {/* Max Text Length Input */}
                <div className='flex flex-col'>
                    <label className="font-semibold">Maximum Text Length</label>
                    <input 
                        className="mt-2 p-2 border rounded-md bg-light-background dark:bg-dark-background text-light-foreground dark:text-dark-foreground hover:border-light-secondary dark:hover:border-dark-secondary outline-none focus:ring-2 focus:ring-light-secondary dark:focus:ring-dark-secondary transition-colors duration-300 no-spinner"
                        type='number' 
                        value={textLength} 
                        onChange={handleTextLengthChange}
                    />
                    {!isValidTextLength && (
                        <span className="text-dark-secondary text-base mt-1">Text length must be between {minTextLength} and {maxTextLength} letters.</span>
                    )}
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        type="button"
                        className="flex w-40 justify-center flex-1 px-4 py-3 mt-8 bg-light-secondary text-dark-background rounded-md font-semibold hover:text-light-background hover:bg-light-primary dark:hover:bg-dark-primary transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-light-secondary dark:ring-dark-secondary focus:ring-offset-2"
                        onClick={handleSave}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomizeSearch;
