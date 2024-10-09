import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface CountdownProps {
  isOpen: boolean;
  count: number;
  onClose: () => void;
}

const CountDown: React.FC<CountdownProps> = ({ isOpen, count, onClose }) => {
  const [currentCount, setCurrentCount] = useState<number>(count);

  useEffect(() => {
    if (isOpen) {
      // Reset count when modal opens
      setCurrentCount(count);
    }
  }, [isOpen, count]);
  
  useEffect(() => {
    if (isOpen && currentCount > 0) {
      const timer = setTimeout(() => {
        setCurrentCount((prev) => prev - 1);
      }, 1000);

      // Cleanup the timer on component unmount or when count changes
      return () => clearTimeout(timer);
    } else if (currentCount === 0) {
      const timeout = setTimeout(() => {
        onClose();
      }, 1000); // Delay before closing

      // Cleanup the timeout on unmount or when count changes
      return () => clearTimeout(timeout);
    }
  }, [isOpen, currentCount, onClose]);

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-transform duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
    >
      <div className="bg-light-background dark:bg-dark-background rounded-lg shadow-lg p-5 w-full sm:w-[90%] max-w-3xl max-h-[99vh] overflow-y-auto hide-scrollbar flex flex-col items-center justify-center">
        
        {/* Container for the image to maintain its size */}
        <div className="flex items-center justify-center mb-4">
          <Image 
            src="/storysets/go.svg" 
            alt="Go illustration" 
            className="object-contain" // Maintain aspect ratio
            height={240} // Fixed height
            width={240} // Fixed width
          />
        </div>

        {/* Display countdown or "Go!" */}
        {currentCount > 0 ? (
          <>
            <h1 className="text-6xl font-bold text-dark-background dark:text-light-background text-center">
              {currentCount}
            </h1>
            <p className="text-lg text-center mt-4 text-dark-background dark:text-light-background">Get Ready!</p>
          </>
        ) : (
          <div className="text-3xl font-bold text-light-secondary dark:text-dark-secondary">
            Go!
          </div>
        )}
      </div>
    </div>
  );
};

export default CountDown;
