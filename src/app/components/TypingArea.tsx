import React, { useEffect, useRef, useState } from "react";
import { useTheme } from '../context/ThemeContext';

interface TypingAreaProps {
  textToType: string;
  isStarted?: boolean;
  disabled?: boolean;
  onComplete?: (speed: number, time: number) => void;
  onUserTyped?: () => void; 
  onInputChange?: (inputText: string) => void;
  inputText?: string; ///input text to display's opponent progress in compete mode
  type?: 'practice' | 'compete';
}

const TypingArea: React.FC<TypingAreaProps> = ({ textToType, isStarted, disabled, inputText, onComplete, onUserTyped, onInputChange, type }) => {
  const { isDarkMode } = useTheme();
  const [userInput, setUserInput] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [lastInputTime, setLastInputTime] = useState<number | null>(null);
  const typingRef = useRef<HTMLDivElement>(null);
  const [inputHeight, setInputHeight] = useState<number>(150); // State for dynamic height
  const trimmedTextToType = textToType && textToType.trimEnd() ? textToType.trimEnd() : null;

  const calculateSpeed = (text: string, timeInSeconds: number) => {
    const words = text.trim().split(/\s+/).length;
    const minutes = timeInSeconds / 60;
    return Math.round(words / minutes);
  };
  const calculateHeight = () => {
    const baseHeight = 150; // Default base height
    if (!textToType) return baseHeight;
  
    const screenWidth = window.innerWidth; // Get current screen width
    let widthFactor = 1; // Default width factor
    const textLength = textToType.length || 0; // Length of the text to type
  
    // For small screens (<=800px), increase the height aggressively
    if (screenWidth <= 800) {
      widthFactor = 1.8 + (800 - screenWidth) / 800; // Larger factor for smaller screens
    } else if (screenWidth <= 1200) {
      // For medium screens (800px to 1200px), apply a moderate increase
      widthFactor = 1.2 + (1200 - screenWidth) / 1200; // Moderate factor for medium screens
    } else if (screenWidth > 1200 && textLength > 500) {
      // Only increase the height on large screens if the text length is over 500 characters
      widthFactor = 1.05; // Small increase for large screens with long text
    }
  
    // Adjust height based on text length, but for small screens, increase more
    const textFactor = Math.max(1, textLength / 400); // Text factor based on length
  
    // Calculate the new height and cap it at 600px, or 150px if the typing hasn't started
    const newHeight = isStarted
      ? Math.min(baseHeight * widthFactor * textFactor, 2000) // Cap at 600px
      : baseHeight;
  
    return newHeight; // Return the calculated height
  };

  useEffect(() => {
    inputText? setUserInput(inputText) : null; // eslint-disable-line @typescript-eslint/no-unused-expressions
  }, [inputText])
  
  
  // Reset all states and height when textToType changes
  useEffect(() => {
    setUserInput('');
    setIsCompleted(false);
    setStartTime(null); // Reset the start time
    setLastInputTime(null); // Reset last input time
    setCurrentSpeed(0); // Reset speed counter
    setInputHeight(calculateHeight()); // Update height when textToType changes
  }, [textToType, isStarted]);

  // Handle input changes
  const handleInputChange = (e: React.FormEvent<HTMLDivElement>) => {
    if (isStarted && !disabled) {
      const inputText = e.currentTarget.textContent || "";
      const currentTime = Date.now();

      if (trimmedTextToType) {
        if (inputText.length <= trimmedTextToType.length) {
          // Call onUserTyped if the first letter is being typed
          if (userInput.length === 0 && inputText.length > 0 && onUserTyped) {
            onUserTyped();
          }

          if (startTime === null) {
            setStartTime(currentTime); // Start timing when first input happens
          }
          setUserInput(inputText);
          setCursorPosition(inputText.length);
          setLastInputTime(currentTime);

          const elapsedTime = (currentTime - (startTime || currentTime)) / 1000;
          const speed = calculateSpeed(inputText, elapsedTime);
          setCurrentSpeed(speed);

          if(type === 'compete'){
            onInputChange? onInputChange(inputText) : null; // eslint-disable-line @typescript-eslint/no-unused-expressions
          }

          if (inputText === trimmedTextToType) {
            setIsCompleted(true);
            onComplete?.(currentSpeed, elapsedTime);
          }
        
          // Update height dynamically based on new input
          setInputHeight(calculateHeight());
        }
      } else {
        e.preventDefault();
        typingRef.current!.textContent = userInput; // Prevent exceeding the text length
      }
    }
  };

  useEffect(() => {
    typingRef.current?.focus();
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (lastInputTime !== null && !isCompleted && isStarted) {
      intervalId = setInterval(() => {
        const currentTime = Date.now();
        const timeSinceLastInput = (currentTime - lastInputTime) / 1000;

        if (timeSinceLastInput > 1) {
          setCurrentSpeed(prevSpeed => Math.max(0, prevSpeed - 1));
        }
      }, 100);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [lastInputTime, isCompleted, isStarted]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (e.key === 'Backspace' && cursorPosition > 0) {
      e.preventDefault();
      const newInput = userInput.slice(0, cursorPosition - 1) + userInput.slice(cursorPosition);
      setUserInput(newInput);
      setCursorPosition(cursorPosition - 1);
      setLastInputTime(Date.now());

      // Update height dynamically on deletion
      setInputHeight(calculateHeight());
    }
  };

  useEffect(() => {
    const selection = window.getSelection();
    const range = document.createRange();
    if (typingRef.current?.firstChild) {
      range.setStart(typingRef.current.firstChild, cursorPosition);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [cursorPosition]);

  useEffect(() => {
    const handleResize = () => {
      setInputHeight(calculateHeight()); // Recalculate height when window is resized
    };
  
    window.addEventListener('resize', handleResize);
  
    // Cleanup event listener when component unmounts or textToType changes
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [textToType, isStarted]); // Dependencies for re-attaching the listener

  const renderText = () => {
    return trimmedTextToType?.split("").map((char, index) => {
      if (index < userInput.length) {
        const isCorrect = userInput[index] === char;
        return (
          <span 
            key={index} 
            className={`text-lg ${isCorrect ? (isDarkMode ? 'text-white' : 'text-black') : 'text-red-500'}`}
            style={{ fontFamily: 'STIX' }}
          >
            {char}
          </span>
        );
      } else {
        return (
          <span key={index} className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} style={{ fontFamily: 'STIX' }}>
            {char}
          </span>
        );
      }
    });
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto p-6 border-2 rounded-lg border-light-secondary dark:border-dark-secondary mb-4">
    <div className="absolute top-6 left-6 right-6 bottom-20 pointer-events-none whitespace-pre-wrap font-stix leading-normal">
      {renderText()}
    </div>
  
    <div
      ref={typingRef}
      contentEditable={!isCompleted && !disabled}
      onInput={handleInputChange}
      onKeyDown={handleKeyDown}
      className={`relative w-full text-lg font-normal focus:outline-none overflow-y-auto `}
      style={{
        whiteSpace: "pre-wrap",
        caretColor: isDarkMode ? "white" : "black",
        fontFamily: 'STIX',
        lineHeight: '1.5',
        color: 'transparent',
        zIndex: 1,
        height: `${inputHeight}px`, // Use calculated height
        paddingBottom: '60px', // Extra padding at the bottom to prevent overlap
      }}
    >
      {userInput}
    </div>
  
    {isStarted && (
      <>
        {/* Speed and character count */}
        <div className="absolute bottom-2 left-6 text-sm mt-3">
          Speed: {currentSpeed} WPM
        </div>
        <div className="absolute bottom-2 right-6 text-sm mt-3">
          {userInput.length} / {trimmedTextToType?.length} characters
        </div>

        {/* Percentage progress in the middle */}
        {trimmedTextToType && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm mt-3">
            {Math.floor((userInput.length / trimmedTextToType?.length) * 100)}%
          </div>
        )}
      </>
    )}

  </div>
  
  );
};

export default TypingArea;
