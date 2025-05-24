'use client';

import React, { useState, useEffect, useRef } from 'react';
import TypingArea from './TypingArea';
import { Room, User } from '../lib/types';
import { apiPusherSendMessage, apiUpdateRoom } from '../lib/apiHelper';
import Pusher from 'pusher-js';
import Alert from './Alert';
import { useRouter } from 'next/navigation';
import WinnerModal from './WinnerModal';
import { FaSpinner } from 'react-icons/fa';

interface CompeteRoomProps {
  room: Room;
  currentUser: User | null;
  opponent: User | undefined;
  onReady?: () => void;
  isStarted?: boolean;
}

const CompeteRoom: React.FC<CompeteRoomProps> = ({ room, currentUser, opponent, onReady, isStarted }) => {
  const [userReady, setUserReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [opponentInputText, setOpponentInputText] = useState('');
  const [timer, setTimer] = useState(0);
  const [tempTextToType, setTempTextToType] = useState('Press Ready button to start');
  const [textToType, setTextToType] = useState(tempTextToType);
  const [status, setStatus] = useState<{ status: string; message: string; bg?: string }>();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [joinedOpponent, setJoinedOpponent] = useState<User | null>();
  const [isOpponentMounted, setIsOpponentMounted] = useState(false);
  const [opponentPlayAgain, setOpponentPlayAgain] = useState(false);
  const [currentUserPlayAgain, setCurrentUserPlayAgain] = useState(false);
  const [winner, setWinner] = useState<{ user: User; speed: number; time: number }>();
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);
  const [isWinnerCurrentUser, setIsWinnerCurrentUser] = useState(false);
  const [playAgain, setPlayAgain] = useState(false);
  const [freezeTimer, setFreezeTimer] = useState(false);
  const [tie] = useState<{ status: boolean; speed: number; time: number }>();
  const [userRestart, setUserRestart] = useState(false);
  const [opponentRestart, setOpponentRestart] = useState(false);
  const [userScore, setUserScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const router = useRouter();
  const isMounted = useRef(false);

  //clean up
  useEffect(() => {
    setStatus({ status: 'null', message: 'null' });
  }, []);

  const handleComplete = async (speed: number, time: number) => {
    await apiPusherSendMessage(room.roomId, 'on-win', JSON.stringify({ speed: speed, time: time }), JSON.parse(JSON.stringify(currentUser)));
    stopTimer();
  };

  const handleRestart = async () => {
    setUserRestart(true);
    setUserScore(0);
    setOpponentScore(0);
    await apiPusherSendMessage(room.roomId, 'on-restart', 'restart', JSON.parse(JSON.stringify(currentUser)));
  };

  useEffect(() => {
    if (userRestart && opponentRestart) {
      sendReadyEvent();
      setTimeout(() => {
        onReady ? onReady() : null; // eslint-disable-line @typescript-eslint/no-unused-expressions
        resetTimer();
        setUserRestart(false);
        setOpponentRestart(false);
      }, 2000);
    }
  }, [userRestart, opponentRestart]);

  const handleOpponentComplete = (speed: number) => {
    console.log({ speed });
  };

  const handleUserReady = async () => {
    await apiPusherSendMessage(room.roomId, 'on-ready', 'ready', JSON.parse(JSON.stringify(currentUser)));
    setUserReady(true);
  };

  useEffect(() => {
    if (userReady && opponentReady) {
      onReady ? onReady() : null; // eslint-disable-line @typescript-eslint/no-unused-expressions
      setTextToType(tempTextToType);
      setUserReady(false);
      setOpponentReady(false);
    }
  }, [userReady, opponentReady]);

  useEffect(() => {
    const sendPlayAgainEvent = async () => {
      await apiPusherSendMessage(room.roomId, 'on-play-again', 'user want to play again', JSON.parse(JSON.stringify(currentUser)));
    };

    if (playAgain) {
      setCurrentUserPlayAgain(true);
      sendPlayAgainEvent();
    }
  }, [playAgain]);

  const sendReadyEvent = async () => {
    await apiPusherSendMessage(room.roomId, 'on-ready', 'ready', JSON.parse(JSON.stringify(currentUser)));
  };

  useEffect(() => {
    if (currentUserPlayAgain && opponentPlayAgain) {
      sendReadyEvent();
      setIsWinnerModalOpen(false);
      setStatus({ status: 'null', message: 'null' });
      onReady ? onReady() : null; // eslint-disable-line @typescript-eslint/no-unused-expressions
      setPlayAgain(false);
      setCurrentUserPlayAgain(false);
      setOpponentPlayAgain(false);
      resetTimer();
    }
  }, [currentUserPlayAgain, opponentPlayAgain]);

  const resetTimer = () => {
    setTimer(0);
    setFreezeTimer(false);
  };

  const stopTimer = () => {
    setFreezeTimer(true);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isStarted && !freezeTimer) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStarted]);

  const handleUserInputChange = async (inputText: string) => {
    await apiPusherSendMessage(room.roomId, 'on-text-update', inputText, JSON.parse(JSON.stringify(currentUser)));
  };

  useEffect(() => {
    const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '',
    });

    const channel = pusherClient.subscribe(`room-${room.roomId}`);

    channel.bind('pusher:subscription_succeeded', () => {});

    channel.bind('on-join', (data: { message: string; user: User; users: User[] }) => {
      if (data.user.username !== currentUser?.username) {
        setStatus({ status: 'A new player joined', message: `${data.user.username} joined!`, bg: 'bg-blue-500' });
        setIsAlertOpen(true);
        setJoinedOpponent(data.user);
        setTimeout(() => {
          setIsAlertOpen(false);
        }, 4000);
      }
    });

    channel.bind('on-ready', (data: { user: User }) => {
      if (data.user.username !== currentUser?.username) {
        setOpponentReady(true);
      }
    });

    channel.bind('on-text-to-type', (data: { textToType: string }) => {
      console.log('on text to type:', data);
      setTempTextToType(data.textToType);
      setTextToType(data.textToType);
    });

    channel.bind('on-text-update', (data: { message: string; messageType: string; user: User }) => {
      if (data.user.username !== currentUser?.username) {
        setOpponentInputText(data.message);
      }
    });

    channel.bind('on-win', (data: { user: User; speed: number; time: number }) => {
      setWinner({ user: data.user, speed: data.speed, time: data.time });
      setIsWinnerCurrentUser(data.user.username === currentUser?.username);
      setIsWinnerModalOpen(true);
    });

    channel.bind('on-leave', (data: { user: User }) => {
      if (data.user.username !== currentUser?.username) {
        setStatus({ status: 'Player disconnected', message: `${data.user.username} disconnected!`, bg: 'bg-red-500' });
        setIsAlertOpen(true);
        setTimeout(() => {
          setIsAlertOpen(false);
          router.push('/');
        }, 3000);
      }
    });

    channel.bind('on-play-again', (data: { user: User }) => {
      if (data.user.username !== currentUser?.username) {
        setOpponentPlayAgain(true);
        setStatus({ status: 'Play Again', message: `${data.user.username} wants to play some more!` });
      }
    });

    channel.bind('on-restart', (data: { user: User }) => {
      if (data.user.username !== currentUser?.username) {
        setOpponentRestart(true);
        setStatus({ status: 'Restart', message: `${data.user.username} wants to restart the game!`, bg: 'bg-blue-500' });
        setIsAlertOpen(true);
        setTimeout(() => {
          setIsAlertOpen(false);
        }, 4000);
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [room.roomId, currentUser]);

  useEffect(() => {
    // Set the ref to true when the component mounts
    isMounted.current = true;

    // Cleanup function to be executed when component unmounts
    return () => {
      isMounted.current = false; // Set the ref to false when unmounted
      const handleCleanup = async () => {
        // Only send "on-leave" message if both users have mounted the component
        if (!isMounted.current && isOpponentMounted) {
          //user left, notify other user
          await apiPusherSendMessage(room.roomId, 'on-leave', 'user disconnected', JSON.parse(JSON.stringify(currentUser)));
          //update room data
          await apiUpdateRoom(room.roomId, currentUser?.id, 'left');
        }
      };

      handleCleanup();
    };
  }, [room.roomId, currentUser, isOpponentMounted]);

  useEffect(() => {
    if (opponent) {
      setIsOpponentMounted(true);
    }
  }, [opponent]);

  const handlePlayAgain = () => {
    setPlayAgain(true);
  };

  useEffect(() => {
    if (winner) {
      if (winner.user.username === currentUser?.username) {
        setUserScore(prev => prev + 1);
      } else {
        setOpponentScore(prev => prev + 1);
      }
    }
  }, [winner, currentUser?.username]);

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-8 h-full">
      {/* Competition area - Split screen */}
      <div className="flex flex-col sm:flex-row flex-grow w-full relative">
        {/* User's side */}
        <div className="w-full sm:w-1/2 flex flex-col items-center sm:pr-4 md:mb-8 mb-0">
          {/* Display Restart button and Timer when the game is started */}
          {isStarted ? (
            <div className="flex items-center justify-between w-full mb-4">
              {/* Restart button on the left */}
              <button onClick={handleRestart} className={`mt-1 mr-3 px-4 py-2 rounded-lg ${userRestart ? 'disabled bg-light-secondary dark:bg-dark-secondary text-dark-background dark:text-light-background opacity-70 cursor-auto' : 'bg-light-secondary hover:bg-light-primary dark:bg-dark-secondary dark:hover:bg-dark-primary text-dark-foreground transition-colors duration-300'}`}>
                {userRestart ? (
                  <div className="flex flex-row">
                    <FaSpinner className="animate-spin mr-3 mt-1" />
                    <span>Waiting for {opponent?.username || 'Opponent'}</span>
                  </div>
                ) : (
                  <span>Restart</span>
                )}
              </button>

              {/* Player's Name - Centered */}
              <h2 className="text-2xl mx-auto">{currentUser?.username || 'You'}</h2>

              {/* Timer on the right */}
              <div className="bg-light-secondary dark:bg-dark-secondary text-dark-background dark:text-light-background py-2 px-5 rounded-lg shadow-md ml-3">
                <div className="text-1xl font-bold">{timer}s</div>
              </div>
            </div>
          ) : (
            // When the game hasn't started
            <div className="flex justify-center items-center mb-4">
              <h2 className="text-2xl mr-3">{currentUser?.username || 'You'}</h2>
              <button onClick={handleUserReady} className={`mt-1 ml-1 px-4 py-2 rounded-lg ${userReady ? 'disabled bg-light-secondary dark:bg-dark-secondary text-light-background opacity-70 cursor-auto' : 'bg-light-secondary hover:bg-light-primary dark:bg-dark-secondary dark:hover:bg-dark-primary text-dark-foreground transition-colors duration-300'}`}>
                {userReady ? (
                  <div className="flex flex-row">
                    <FaSpinner className="animate-spin mr-3 mt-1" />
                    <span>Waiting for {opponent?.username || 'Opponent'}</span>
                  </div>
                ) : (
                  <span>Ready?</span>
                )}
              </button>
            </div>
          )}

          {/* Typing area for user */}
          <TypingArea textToType={textToType} isStarted={isStarted} onComplete={(speed, time) => handleComplete(speed, time)} onInputChange={(inputText) => handleUserInputChange(inputText)} type="compete" />
          
          {/* Add score display for user */}
          <div className="absolute bottom-4 left-4 bg-light-secondary dark:bg-dark-secondary text-dark-background dark:text-light-background py-2 px-4 rounded-lg shadow-md">
            <div className="text-lg font-bold">Score: {userScore}</div>
          </div>
        </div>

        {/* Vertical line separator (visible only on larger screens) */}
        <div className="hidden sm:block w-px bg-black dark:bg-white mx-4 relative">
          <div className="absolute left-0 top-0 w-px h-full bg-black dark:bg-white"></div>
        </div>

        {/* Opponent's side */}
        <div className="w-full sm:w-1/2 flex flex-col items-center sm:pl-4">
          <div className="flex justify-center items-center w-full mb-4">
            <h2 className="text-2xl mr-3">{opponent?.username || joinedOpponent?.username || 'Opponent'}</h2>
            {!isStarted && (
              <button onClick={handleUserReady} className={`mt-1 ml-1 px-4 py-2 rounded-lg ${userReady ? 'disabled bg-light-secondary dark:bg-dark-secondary text-dark-background dark:text-light-background opacity-70 cursor-auto' : 'bg-light-secondary hover:bg-light-primary dark:bg-dark-secondary dark:hover:bg-dark-primary text-dark-foreground transition-colors duration-300'}`}>
                {opponentReady ? (
                  <div className="flex flex-row">
                    <FaSpinner className="animate-spin mr-3 mt-1" />
                    <span>Waiting for {currentUser?.username || 'Opponent'}</span>
                  </div>
                ) : (
                  <span>Ready?</span>
                )}
              </button>
            )}
          </div>

          {/* Typing area for opponent */}
          <TypingArea textToType={textToType} isStarted={isStarted} onComplete={handleOpponentComplete} inputText={opponentInputText} disabled={true} type="compete" />
          
          {/* Add score display for opponent */}
          <div className="absolute bottom-4 right-4 bg-light-secondary dark:bg-dark-secondary text-dark-background dark:text-light-background py-2 px-4 rounded-lg shadow-md">
            <div className="text-lg font-bold">Score: {opponentScore}</div>
          </div>
        </div>

        {isAlertOpen && <Alert title={status?.status} message={status?.message} bg={status?.bg} onClose={() => setIsAlertOpen(false)} />}
      </div>

      <WinnerModal isOpen={isWinnerModalOpen} currentUser={currentUser} opponent={opponent} tie={tie} winner={winner} isWinnerCurrentUser={isWinnerCurrentUser} onClose={() => setIsWinnerModalOpen(false)} onPlayAgain={handlePlayAgain} playAgainStatus={status} />
    </div>
  );
};

export default CompeteRoom;
