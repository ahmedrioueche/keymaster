import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { FaBalanceScale, FaSadCry, FaSpinner, FaStar, FaTimes, FaTrophy } from 'react-icons/fa';
import Confetti from 'react-confetti';
import useSound from 'use-sound';
import { User } from '../lib/types';
import { useRouter } from 'next/navigation';
import { apiUpdateUser } from '../lib/apiHelper';

interface WinnerModalProps {
  isOpen: boolean;
  currentUser: User | null;
  opponent: User | undefined;
  tie: { status: boolean; speed: number; time: number } | undefined;
  isWinnerCurrentUser: boolean;
  winner: { user: User; speed: number; time: number } | undefined;
  onClose: () => void;
  onPlayAgain: () => void;
  playAgainStatus: { status: string; message: string; bg?: string } | undefined;
}

const WinnerModal: React.FC<WinnerModalProps> = ({ isOpen, currentUser, opponent, tie, winner, isWinnerCurrentUser, playAgainStatus, onClose, onPlayAgain }) => {
  const [playCheer] = useSound('/sounds/cheer.mp3');
  const [playLose] = useSound('/sounds/lose.mp3');
  const [showConfetti, setShowConfetti] = useState(false);
  const [playAgainClicked, setPlayAgainClicked] = useState(false);
  const [score, setScore] = useState(20); //eslint-disable-line @typescript-eslint/no-unused-vars
  const confettiDuration = 5000;
  const router = useRouter();

  //clean up
  useEffect(() => {
    setPlayAgainClicked(false);
  }, [isOpen]);

  useEffect(() => {
    if (currentUser?.settings?.soundEffects === true) {
      if (isOpen) {
        if (isWinnerCurrentUser) playCheer();
        else playLose();
      }
    }
  }, [isOpen, isWinnerCurrentUser, playCheer]);

  useEffect(() => {
    if (isWinnerCurrentUser) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, confettiDuration);

      // Cleanup timer on component unmount
      return () => clearTimeout(timer);
    }
  }, [isWinnerCurrentUser]);

  const handleClose = () => {
    router.push('/');
    onClose();
  };

  const handlePlayAgain = () => {
    setPlayAgainClicked(true);
    onPlayAgain();
  };

  useEffect(() => {
    const getScore = (speed: number | undefined) => {
      // Check if speed is valid and greater than 0
      if (speed !== undefined && speed > 0) {
        return parseInt((speed / 1.5).toString(), 10);
      }
      // Return default score for invalid speed
      return 20;
    };

    const updateUser = async (score: number) => {
      if (tie?.status) {
        currentUser?.id ? await apiUpdateUser(currentUser?.id, { stars: score }) : null; //eslint-disable-line @typescript-eslint/no-unused-expressions
        opponent?.id ? await apiUpdateUser(opponent?.id, { stars: score }) : null; //eslint-disable-line @typescript-eslint/no-unused-expressions
      }

      if (isWinnerCurrentUser) {
        winner?.user?.id ? await apiUpdateUser(winner?.user?.id, { stars: score }) : null; //eslint-disable-line @typescript-eslint/no-unused-expressions
        const currentUser = {
          ...winner?.user,
          stars: winner?.user?.stars ? winner.user.stars + score : score,
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }
    };

    updateUser(getScore(tie?.status ? tie?.speed : winner?.speed));
  }, [isOpen]);

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-transform duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
      <div className="bg-light-background dark:bg-dark-background rounded-lg shadow-lg p-5 w-full sm:w-[90%] max-w-md max-h-[95vh] overflow-y-auto hide-scrollbar">
        {/* Conditional Confetti Effect if the current user won */}
        {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={true} />}
        <div className="flex justify-between items-center mb-4">
          {tie?.status ? (
            <div className="flex items-center text-light-primary dark:text-dark-primary">
              <FaBalanceScale height={30} width={30} className="text-3xl mr-3" />
              <h2 className="text-xl font-bold mt-1 font-dancing">Tie!</h2>
            </div>
          ) : isWinnerCurrentUser ? (
            <div className="flex items-center text-light-primary dark:text-dark-primary">
              <FaTrophy height={30} width={30} className="text-3xl mr-3" />
              <h2 className="text-xl font-bold mt-1 font-dancing">Winner!</h2>
            </div>
          ) : (
            <div className="flex items-center text-light-primary dark:text-dark-primary">
              <FaSadCry height={30} width={30} className="text-3xl mr-3" />
              <h2 className="text-xl font-bold mt-1 font-dancing">You lost!</h2>
            </div>
          )}

          <button onClick={handleClose} className="p-2 rounded-full bg-light-background hover:bg-light-accent dark:hover:bg-dark-secondary transition-colors duration-300 text-gray-700">
            <FaTimes size={16} />
          </button>
        </div>

        {tie?.status && (
          <div className="flex flex-col items-center justify-center">
            <Image src="/storysets/tie.svg" alt="Winner illustration" className="w-full h-48 object-contain" height={48} width={38} />

            <h2 className="mt-6 text-3xl font-bold text-light-primary dark:text-dark-primary">Tie!</h2>

            {/* Display user's speed and time */}
            <div className="flex flex-col items-center mt-4">
              <div className="text-lg text-light-foreground dark:text-dark-foreground text-center">
                You completed at {tie?.speed} words per minute in {tie?.time} seconds.
              </div>
              <div className="flex flex-row text-lg text-light-foreground dark:text-dark-foreground text-center">
                <span className="mr-1">You got +{score} </span>
                <FaStar className="mt-1 text-light-primary dark:text-dark-primary" />
              </div>
              {playAgainStatus && playAgainStatus?.status === 'Play Again' && <div className="flex justify-center text-light-primary dark:text-dark-primary text-xl mt-2">{playAgainStatus.message}</div>}
            </div>

            {/* Play Again Button */}
            <button onClick={handlePlayAgain} className={`mt-4 px-4 py-2 rounded-lg ${playAgainClicked ? 'disabled bg-light-secondary dark:bg-dark-secondary text-dark-background dark:text-light-background opacity-70 cursor-auto' : 'bg-light-primary text-white hover:bg-light-accent dark:bg-dark-primary dark:hover:bg-dark-accent hover:text-light-foreground transition-colors duration-300'} `}>
              {playAgainClicked ? (
                <div className="flex flex-row">
                  <FaSpinner className="animate-spin mr-3 mt-1" />
                  <span>Waiting for {opponent?.username ? opponent?.username : 'Opponent'}</span>
                </div>
              ) : (
                <span>Play Again</span>
              )}
            </button>
          </div>
        )}
        {/* If the current user is the winner */}
        {isWinnerCurrentUser && !tie?.status && (
          <div className="flex flex-col items-center justify-center">
            <Image src="/storysets/winner.svg" alt="Winner illustration" className="w-full h-48 object-contain" height={48} width={38} />

            <h2 className="mt-6 text-3xl font-bold text-light-primary dark:text-dark-primary">Winner! Nice Work!</h2>

            {/* Display user's speed and time */}
            <div className="flex flex-col items-center mt-4">
              <div className="text-lg text-light-foreground dark:text-dark-foreground text-center">
                You completed at {winner?.speed} words per minute in {winner?.time} seconds.
              </div>
              <div className="flex flex-row text-lg text-light-foreground dark:text-dark-foreground text-center">
                <span className="mr-1">You got +{score} </span>
                <FaStar className="mt-1 text-light-primary dark:text-dark-primary" />
              </div>
            </div>

            {/* Play Again Button */}
            <button onClick={handlePlayAgain} className={`mt-4 px-4 py-2 rounded-lg ${playAgainClicked ? 'disabled bg-light-secondary dark:bg-dark-secondary text-dark-background dark:text-light-background opacity-70 cursor-auto' : 'bg-light-primary text-white hover:bg-light-accent dark:bg-dark-primary dark:hover:bg-dark-accent hover:text-light-foreground transition-colors duration-300'} `}>
              {playAgainClicked ? (
                <div className="flex flex-row">
                  <FaSpinner className="animate-spin mr-3 mt-1" />
                  <span>Waiting for {opponent?.username ? opponent?.username : 'Opponent'}</span>
                </div>
              ) : (
                <span>Play Again</span>
              )}
            </button>
            {playAgainStatus && playAgainStatus?.status === 'Play Again' && <div className="flex justify-center text-light-secondary dark:text-dark-secondary text-xl mt-2">{playAgainStatus.message}</div>}

          </div>
        )}

        {!isWinnerCurrentUser && !tie?.status && (
          /* If the opponent won */
          <div className="flex flex-col items-center justify-center">
            <Image src="/storysets/sad.svg" alt="Lost illustration" className="w-full h-48 object-contain" height={48} width={38} />

            <h2 className="mt-6 text-2xl font-bold text-light-primary dark:text-dark-primary">{opponent?.username} Won!</h2>

            {/* Display opponent's speed and time */}
            <div className="flex flex-col items-center">
              <div className="flex justify-center mt-4 text-lg text-light-foreground dark:text-dark-foreground text-center">
                {winner?.user.username} completed at {winner?.speed} words per minute in {winner?.time} seconds.
              </div>
            </div>
            {/* Play Again Button */}
            <button onClick={handlePlayAgain} className={`mt-4 px-4 py-2 rounded-lg ${playAgainClicked ? 'disabled bg-light-secondary dark:bg-dark-secondary text-dark-background dark:text-light-background opacity-70 cursor-auto' : 'bg-light-primary text-white hover:bg-light-accent dark:bg-dark-primary dark:hover:bg-dark-accent hover:text-light-foreground transition-colors duration-300'} `}>
              {playAgainClicked ? (
                <div className="flex flex-row">
                  <FaSpinner className="animate-spin mr-3 mt-1" />
                  <span>Waiting for {opponent?.username ? opponent?.username : 'Opponent'}</span>
                </div>
              ) : (
                <span>Play Again</span>
              )}
            </button>
            {playAgainStatus && playAgainStatus?.status === 'Play Again' && <div className="flex justify-center text-light-secondary dark:text-dark-secondary text-xl mt-2">{playAgainStatus.message}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default WinnerModal;
