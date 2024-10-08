"use client";

import React, { useState, useEffect, useRef } from "react";
import TypingArea from "./TypingArea";
import { Room, User } from "../types/types";
import { apiPusherSendMessage, apiUpdateRoom } from "../utils/apiHelper";
import Pusher from "pusher-js";
import Alert from "./Alert";
import { useRouter } from "next/navigation";
import WinnerModal from "./WinnerModal";

interface CompeteRoomProps {
  room: Room;
  currentUser: User | null;
  opponent: User | undefined;
  onReady?: () => void;
  isStarted?: boolean;
}

const CompeteRoom: React.FC<CompeteRoomProps> = ({
  room,
  currentUser,
  opponent,
  onReady,
  isStarted,
}) => {
  const [userSpeed, setUserSpeed] = useState(0); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [opponentSpeed, setOpponentSpeed] = useState(0); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [userReady, setUserReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [opponentInputText, setOpponentInputText] = useState('');
  const [timer, setTimer] = useState(0);
  const [textToType, setTextToType] = useState('Press Ready button to start');
  const [temptextToType, setTempTextToType] = useState('Press Ready button to start');
  const [status, setStatus] = useState<{status: string, message: string, bg?: string}>();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [joinedOpponent, setJoinedOpponent] = useState<User | null>();
  const [isOpponentMounted, setIsOpponentMounted] = useState(false);
  const [opponentPlayAgain, setOpponentPlayAgain] = useState(false);
  const [currentUserPlayAgain, setCurrentUserPlayAgain] = useState(false);
  const [winner, setWinner] = useState<{user: User, speed: number, time: number}>();
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);
  const [isWinnerCurrentUser, setIsWinnerCurrentUser] = useState(false);
  const [playAgain, setPlayAgain] = useState(false);
  const [freezeTimer, setFreezeTimer] = useState(false);
  
  const router = useRouter();
  const isMounted = useRef(false); 

  //clean up
  useEffect(() => {
    setStatus({status:"null", message: "null" });
  }, [])

  const handleComplete = async (speed: number, time: number) => {
    const response = await apiPusherSendMessage(room.roomId, "on-win", JSON.stringify({speed: speed, time: time}), JSON.parse(JSON.stringify(currentUser)));
    console.log("response", response);
    stopTimer();
    setUserSpeed(speed);
  };

  const handleOpponentComplete = (speed: number) => {
    setOpponentSpeed(speed);
  };

  const handleUserReady = async () => {
    const response = await apiPusherSendMessage(room.roomId, "on-ready", "ready", JSON.parse(JSON.stringify(currentUser)));
    console.log("response", response);
    setUserReady(true);
  };

  useEffect(() => {
    if(userReady && opponentReady){
      onReady ? onReady() : null; // eslint-disable-line @typescript-eslint/no-unused-expressions
      setTextToType(temptextToType);
    }
  }, [userReady, opponentReady])

  useEffect(() => {

    const sendPlayAgainEvent = async () => {
      const response = await apiPusherSendMessage(room.roomId, "on-play-again", "user want to play again", JSON.parse(JSON.stringify(currentUser)));
      console.log("response", response);
    }

    if(playAgain){
      setCurrentUserPlayAgain(true)
      sendPlayAgainEvent()
    }

  }, [playAgain])

  useEffect(() => {
    if(currentUserPlayAgain && opponentPlayAgain){
      setIsWinnerModalOpen(false);
      setStatus({status:"null", message: "null" });
      onReady ? onReady() : null; // eslint-disable-line @typescript-eslint/no-unused-expressions
      setTextToType(temptextToType);
      setPlayAgain(false);
      setCurrentUserPlayAgain(false);
      setOpponentPlayAgain(false);
      resetTimer();
    }
  }, [currentUserPlayAgain, opponentPlayAgain])

  const resetTimer = () => {
    setTimer(0);
    setFreezeTimer(false);
  }

  const stopTimer = () => {
    setFreezeTimer(true);
  }

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
    await apiPusherSendMessage(room.roomId, "on-text-update", inputText, JSON.parse(JSON.stringify(currentUser))); 
  }

  useEffect(() => {
    console.log('Initializing Pusher client...');
    const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '',
    });
  
    console.log(`Subscribing to channel room-${room.roomId}...`);
    const channel = pusherClient.subscribe(`room-${room.roomId}`);
  
    channel.bind('pusher:subscription_succeeded', () => {
      console.log(`Successfully subscribed to channel room-${room.roomId}`);
    });
  
    channel.bind('pusher:subscription_error', (error: any) => { //eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Subscription error:', error);
    });
  
    channel.bind('on-join', (data: { message: string, user: User, users: User[] }) => {
        if(data.user.username !== currentUser?.username) {
          setStatus({ status: "A new player joined", message: `${data.user.username} joined!`, bg: 'bg-blue-500' });
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
      setTempTextToType(data.textToType);
    });
  
    channel.bind('on-text-update', (data: { message: string; messageType: string; user: User }) => {
      if (data.user.username !== currentUser?.username) {
        setOpponentInputText(data.message);
      }
    });
  
    channel.bind('on-win', (data: { user: User, speed: number, time: number }) => {
      setWinner({user: data.user, speed: data.speed, time: data.time});
      setIsWinnerCurrentUser(data.user.username === currentUser?.username);
      setIsWinnerModalOpen(true);
    });

    channel.bind('on-leave', (data: { user: User }) => {
      if(data.user.username !== currentUser?.username){
        setStatus({ status: "Player disconnected", message: `${data.user.username} disconnected!`, bg: 'bg-red-500' });
        setIsAlertOpen(true);
        setTimeout(() => {
          setIsAlertOpen(false);
          router.push("/");
        }, 3000);
      }
    });

    channel.bind('on-play-again', (data: { user: User }) => {
      if(data.user.username !== currentUser?.username){
        console.log("Data received on-play-again", data);
        setOpponentPlayAgain(true);
        setStatus({ status: "Play Again", message: `${data.user.username} wants to play some more!`, bg: 'bg-blue-500' });
      }
    });
  
    return () => {
      console.log(`Unsubscribing from channel room-${room.roomId}...`);
      channel.unbind_all();
      channel.unsubscribe();
      console.log('Unsubscribed successfully');
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
        if (!isMounted.current && isOpponentMounted ) {
          //user left, notify other user 
          await apiPusherSendMessage(room.roomId, "on-leave", "user disconnected", JSON.parse(JSON.stringify(currentUser)));
          //update room data
          console.log("currentUser that just left", currentUser);
          await apiUpdateRoom(room.roomId, currentUser?.id, "left");
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
    console.log("play again")
    setPlayAgain(true);
  }

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-8 h-full">
      {/* Competition area - Split screen */}
      <div className="flex flex-col sm:flex-row flex-grow w-full relative">
        {/* User's side */}
        <div className="w-full sm:w-1/2 flex flex-col items-center sm:pr-4 md:mb-8 mb-0">
          <div className="flex justify-center items-center w-full mb-4">
            <h2 className="text-2xl mr-3">{currentUser?.username || "You"}</h2>
            {!isStarted && (
              <button
                className={`bg-light-secondary dark:bg-dark-secondary hover:bg-light-primary dark:hover:bg-dark-primary dark:text-light-background text-dark-background hover:text-light-background py-2 px-4 rounded transition duration-300 ${
                  userReady ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => {
                  handleUserReady();
                }}
                disabled={userReady}
              >
                {userReady ? "Ready!" : "Ready?"}
              </button>
            )}
          </div>
          {/* Typing area for user */}
          <TypingArea
            textToType={textToType}
            isStarted={isStarted}
            onComplete={(speed, time)=> handleComplete(speed, time)}
            onInputChange={(inputText) => handleUserInputChange(inputText)}
            type="compete"
          />
        </div>

        {/* Timer positioned above the line */}
        {isStarted && (
          <div className="absolute top-0 right-0 sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 z-10 bg-light-secondary dark:bg-dark-secondary text-dark-background dark:text-light-background py-1 px-3 rounded-lg shadow-md max-w-fit">
            <div className="text-1xl font-bold">{timer}s</div>
          </div>
        )}

        {/* Vertical line separator (visible only on larger screens) */}
        <div className="hidden sm:block w-px bg-black dark:bg-white mx-4 relative">
          <div className="absolute left-0 top-0 w-px h-full bg-black dark:bg-white"></div>
        </div>

        {/* Opponent's side */}
        <div className="w-full sm:w-1/2 flex flex-col items-center sm:pl-4">
          <div className="flex justify-center items-center w-full mb-4">
            <h2 className="text-2xl mr-3">{opponent?.username || joinedOpponent?.username || "Opponent"}</h2>
            {!isStarted && (
              <button
                className={`bg-light-secondary dark:bg-dark-secondary dark:text-light-background text-dark-background py-2 px-4 rounded ${
                  opponentReady ? "bg-light-primary dark:bg-dark-primary" : "opacity-50"
                } cursor-not-allowed`}
                disabled
              >
                {opponentReady ? "Ready!" : "Ready?"}
              </button>
            )}
          </div>
          {/* Typing area for opponent */}
          <TypingArea
            textToType={textToType}
            isStarted={isStarted}
            onComplete={handleOpponentComplete}
            inputText={opponentInputText}
            disabled={true}
            type="compete"
          />
        </div>
        {isAlertOpen && (
          <Alert 
            title={status?.status}
            message={status?.message}
            bg={status?.bg}
            onClose={()=> setIsAlertOpen(false)}
         />
        )}
      </div>
      <WinnerModal
          isOpen={isWinnerModalOpen}
          winner={winner}
          isWinnerCurrentUser={isWinnerCurrentUser}
          opponentName={opponent?.username}
          onClose={()=> setIsWinnerModalOpen(false)}
          onPlayAgain={handlePlayAgain}
          playAgainStatus={status}
        />
    </div>
  );
};

export default CompeteRoom;
