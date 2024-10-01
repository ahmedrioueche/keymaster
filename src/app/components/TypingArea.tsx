  import React, { useEffect, useRef, useState } from "react";
  import { useTheme } from '../context/ThemeContext';

  interface TypingAreaProps {
    textToType: string;
    onComplete?: (speed: number) => void;
    onUserTyped?: () => void; // Add this line
  }

  const TypingArea: React.FC<TypingAreaProps> = ({ textToType, onComplete, onUserTyped }) => {
    const [userInput, setUserInput] = useState("");
    const [cursorPosition, setCursorPosition] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [currentSpeed, setCurrentSpeed] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [lastInputTime, setLastInputTime] = useState<number | null>(null);
    const typingRef = useRef<HTMLDivElement>(null);
    const { isDarkMode } = useTheme();

    // Ensure trimmedTextToType is updated based on the available textToType
    const trimmedTextToType = (textToType && textToType.trimEnd()) || (window.innerWidth < 768 ? `Loading text...` : `Press "Start" button to start typing`);

    const calculateSpeed = (text: string, timeInSeconds: number) => {
      const words = text.trim().split(/\s+/).length;
      const minutes = timeInSeconds / 60;
      return Math.round(words / minutes);
    };

    useEffect(() => { 
      setUserInput('');
      setIsCompleted(false); // Reset completion state when textToType changes
    }, [textToType]);

    const handleInputChange = (e: React.FormEvent<HTMLDivElement>) => {
      const inputText = e.currentTarget.textContent || "";
      const currentTime = Date.now();

      if (inputText.length <= trimmedTextToType.length) {
        // Call onUserTyped if the first letter is being typed
        if (userInput.length === 0 && inputText.length > 0 && onUserTyped) {
          onUserTyped();
        }

        if (startTime === null) {
          setStartTime(currentTime);
        }
        setUserInput(inputText);
        setCursorPosition(inputText.length);
        setLastInputTime(currentTime);

        const elapsedTime = (currentTime - (startTime || currentTime)) / 1000;
        const speed = calculateSpeed(inputText, elapsedTime);
        setCurrentSpeed(speed);

        if (inputText === trimmedTextToType) {
          setIsCompleted(true);
          onComplete?.(speed);
        }
      } else {
        e.preventDefault();
        typingRef.current!.textContent = userInput; // Prevent exceeding the text length
      }
    };

    useEffect(() => {
      typingRef.current?.focus();
    }, []);

    useEffect(() => {
      let intervalId: NodeJS.Timeout;

      if (lastInputTime !== null && !isCompleted) {
        intervalId = setInterval(() => {
          const currentTime = Date.now();
          const timeSinceLastInput = (currentTime - lastInputTime) / 1000;

          if (timeSinceLastInput > 1) {
            setCurrentSpeed(prevSpeed => {
              const newSpeed = Math.max(0, prevSpeed - 1);
              if (newSpeed === 0) {
                clearInterval(intervalId);
              }
              return newSpeed;
            });
          }
        }, 100);
      }

      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }, [lastInputTime, isCompleted]);

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
      return trimmedTextToType.split("").map((char, index) => {
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
      <div className="relative w-full max-w-5xl mx-auto p-6 border-2 rounded-lg border-light-secondary dark:border-dark-secondary">
        <div className="absolute top-6 left-6 right-6 bottom-12 pointer-events-none whitespace-pre-wrap font-stix leading-normal">
          {renderText()}
        </div>

        <div
          ref={typingRef}
          contentEditable={!isCompleted}
          onInput={handleInputChange}
          onKeyDown={handleKeyDown}
          className="relative w-full h-60 sm:h-60 md:h-36 text-lg font-normal focus:outline-none overflow-y-auto"
          style={{
            whiteSpace: "pre-wrap",
            caretColor: isDarkMode ? "white" : "black",
            fontFamily: 'STIX',
            lineHeight: '1.5',
            color: 'transparent',
            zIndex: 1,
          }}
        >
          {userInput}
        </div>
        <div className="absolute bottom-2 left-6 text-sm">
          Speed : {currentSpeed} WPM
        </div>
        <div className="absolute bottom-2 right-6 text-sm">
          {userInput.length} / {trimmedTextToType.length} characters
        </div>
      </div>
    );
  };

  export default TypingArea;
