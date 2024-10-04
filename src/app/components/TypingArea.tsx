import React, { useEffect, useRef, useState } from "react";
import { useTheme } from '../context/ThemeContext';

interface TypingAreaProps {
  textToType: string;
  isStarted?: boolean;
  textLength?: number;
  onComplete?: (speed: number) => void;
  onUserTyped?: () => void; 
}

const TypingArea: React.FC<TypingAreaProps> = ({ textToType, isStarted, onComplete, onUserTyped, textLength }) => {
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
    const containerWidth = typingRef.current?.clientWidth || 0; // Get current width of the container
    const baseHeight = 150; // Base height in pixels
    const widthFactor = containerWidth / 600; // Assuming 600px is the width for scaling
    const textFactor = Math.max(1, (textLength || 0) / 20); // Adjust this factor based on desired sensitivity to text length

    // Calculate final height
    const calculatedHeight = Math.max(baseHeight, baseHeight * widthFactor * textFactor);
    setInputHeight(calculatedHeight); // Update the state with the new height
  };

  // Reset all states and height when textToType changes
  useEffect(() => {
    setUserInput('');
    setIsCompleted(false);
    setStartTime(null); // Reset the start time
    setLastInputTime(null); // Reset last input time
    setCurrentSpeed(0); // Reset speed counter
    calculateHeight(); // Calculate height on new text
  }, [textToType, isStarted]);

  // Handle input changes
  const handleInputChange = (e: React.FormEvent<HTMLDivElement>) => {
    if (isStarted) {
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

          if (inputText === trimmedTextToType) {
            setIsCompleted(true);
            onComplete?.(currentSpeed);
          }
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
    if (e.key === 'Backspace' && cursorPosition > 0) {
      e.preventDefault();
      const newInput = userInput.slice(0, cursorPosition - 1) + userInput.slice(cursorPosition);
      setUserInput(newInput);
      setCursorPosition(cursorPosition - 1);
      setLastInputTime(Date.now());
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

  // Update height on component mount and window resize
  useEffect(() => {
    calculateHeight(); // Initial height calculation
    window.addEventListener("resize", calculateHeight); // Listen for resize events
    return () => window.removeEventListener("resize", calculateHeight); // Cleanup listener
  }, [textLength]); // Recalculate if textLength changes

  return (
    <div className="relative w-full max-w-5xl mx-auto p-6 border-2 rounded-lg border-light-secondary dark:border-dark-secondary mb-6">
      <div className="absolute top-6 left-6 right-6 bottom-12 pointer-events-none whitespace-pre-wrap font-stix leading-normal">
        {renderText()}
      </div>

      <div
        ref={typingRef}
        contentEditable={!isCompleted}
        onInput={handleInputChange}
        onKeyDown={handleKeyDown}
        className="relative w-full text-lg font-normal focus:outline-none overflow-y-auto"
        style={{
          whiteSpace: "pre-wrap",
          caretColor: isDarkMode ? "white" : "black",
          fontFamily: 'STIX',
          lineHeight: '1.5',
          color: 'transparent',
          zIndex: 1,
          height: `${inputHeight}px`, // Use calculated height
        }}
      >
        {userInput}
      </div>

      {isStarted && (
        <>
          <div className="absolute bottom-2 left-6 text-sm">
            Speed : {currentSpeed} WPM
          </div>
          <div className="absolute bottom-2 right-6 text-sm">
            {userInput.length} / {trimmedTextToType?.length} characters
          </div>
        </>
      )}
    </div>
  );
};

export default TypingArea;
