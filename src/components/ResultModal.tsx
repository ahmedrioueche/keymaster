import React, { useEffect } from 'react';
import Image from 'next/image';
import { FaTimes } from 'react-icons/fa';
import Confetti from 'react-confetti';
import useSound from 'use-sound';

interface ResultModalProps {
  isOpen: boolean;
  user: any;   // eslint-disable-line @typescript-eslint/no-explicit-any
  isNewRecord: boolean;
  onClose: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ isOpen, onClose, user, isNewRecord }) => {
  const [playCheer] = useSound('/sounds/cheer.mp3'); // Path to your cheer sound

  useEffect(() => {
    if (isNewRecord && isOpen && (user?.setting?.userEffects === true)) {
      playCheer(); // Play the cheer sound when a new record is set
    }
  }, [isNewRecord, isOpen, playCheer]);

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-transform duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
    >
      <div className="bg-light-background dark:bg-dark-background rounded-lg shadow-lg p-5 w-full sm:w-[90%] max-w-md max-h-[95vh] overflow-y-auto hide-scrollbar">
        {/* Confetti effect when a new record is set */}
        {isNewRecord && (
          <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />
        )}

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-light-foreground dark:text-dark-foreground">
            <Image src='/icons/results.png' height={30} width={30} className="text-3xl mr-3" alt="Profile" />
            <h2 className="text-xl font-bold mt-1 font-dancing">Result</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-light-background hover:bg-light-accent dark:hover:bg-dark-secondary transition-colors duration-300 text-gray-700"
          >
            <FaTimes size={16} />
          </button>
        </div>

        <div className='flex flex-col items-center justify-center'>
          <Image src="/storysets/result.svg" alt="Result illustration" className="w-full h-48 object-contain" height={48} width={38}/>
          
          {isNewRecord && (
            <div className="mt-4 text-center text-light-primary dark:text-dark-primary text-lg font-bold">
              🎉 New Record! 🎉
            </div>
          )}

          {/* Centering the speed data */}
          <div className="mt-6 flex flex-col items-center justify-center text-center text-light-foreground dark:text-dark-foreground">
            <div className="text-xl font-semibold mb-2">Speed:</div>
            <div className="text-2xl font-bold text-light-primary dark:text-dark-primary">
              {user?.speed ? `${user.speed} words per minute` : 'No speed data available'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
