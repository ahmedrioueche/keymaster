"use client";

import React, { useState, useEffect } from "react";
import TypingArea from "./TypingArea";
import { User } from "../types/types";
import { apiPusherSendMessage } from "../utils/apiHelper";
import Pusher from "pusher-js";

interface CompeteRoomProps {
  roomId: string;
  currentUser: User | null;
  opponent: User | undefined;
  onReady?: () => void;
  isStarted?: boolean;
}

const CompeteRoom: React.FC<CompeteRoomProps> = ({
  roomId,
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

  const handleComplete = (speed: number) => {
    setUserSpeed(speed);
  };

  const handleOpponentComplete = (speed: number) => {
    setOpponentSpeed(speed);
  };

  const handleUserReady = async () => {
    console.log("currentUser", currentUser);  
    const response = await apiPusherSendMessage(roomId, "on-ready", "ready", currentUser?.username);
    console.log("response in handleUserReady", response);
    setUserReady(true);
  };

  useEffect(() => {
    if(userReady && opponentReady){
      onReady ? onReady() : null; // eslint-disable-line @typescript-eslint/no-unused-expressions
      setTextToType(temptextToType);
    }
  }, [userReady, opponentReady])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isStarted) {
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
    const response = await apiPusherSendMessage(roomId, "on-text-update", inputText, currentUser?.username);
    console.log("response", response);
  }

  useEffect(() => {
    const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '',
    });

    const channel = pusherClient.subscribe(`compete-channel-${roomId}`);

    channel.bind('on-text-update', (data: { message: string; messageType: string; username: string }) => {
      console.log('Received data:', data);
      console.log('Received message:', data.message);
      if (data.username !== currentUser?.username) {
        setOpponentInputText(data.message);
      }
      
    });

    channel.bind('on-ready', (data: { username: string }) => {
      if (data.username !== currentUser?.username) {
        setOpponentReady(true);
      }
    });

    channel.bind('on-text-to-type', (data: { textToType: string }) => {
      console.log('Received text to type:', data.textToType);
        setTempTextToType(data.textToType); 
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [roomId]);

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
            onComplete={handleComplete}
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
            <h2 className="text-2xl mr-3">{opponent?.username || "Opponent"}</h2>
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
      </div>
    </div>
  );
};

export default CompeteRoom;
