// pages/compete/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import FindOpponent from "../../../components/FindOpponent";
import CompeteRoom from "../../../components/CompeteRoom";
import { useUser } from "../../context/UserContext";
import { Room, User } from "../../../lib/types";
import CountDown from "@/components/Countdown";
import UserModal from "@/components/UserModal";
import Image from 'next/image';

const CompetePage: React.FC = () => {
 // const user = {
 //   username: "Ahmed",
 // };
  const { currentUser, onSet, userLoggedIn } = useUser(); // eslint-disable-line @typescript-eslint/no-unused-vars 
  const [opponent, setOpponent] = useState<User | null>();
  const [isReady, setIsReady] = useState<boolean>(false); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [countdown, setCountdown] = useState<number>(3); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [isCountdownOpen, setIsCountdownOpen] = useState<boolean>(false);
  const [language, setLanguage] = useState("english");  // eslint-disable-line @typescript-eslint/no-unused-vars
  const [topic, setTopic] = useState("general");  // eslint-disable-line @typescript-eslint/no-unused-vars
  const [textLength, setTextLength] = useState(100); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isFindOpponentOpen, setIsFindOpponentOpen] = useState<boolean>(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [room, setRoom] = useState<Room>();
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [opponentModalCloseGracefully, setOpponentModalCloseGracefully] = useState(false);

  
  useEffect(() => {
    const checkUserWithDelay = setTimeout(() => {
      if (!currentUser) {
        setIsUserModalOpen(true);
      } else if (!opponent) {
        setIsFindOpponentOpen(true);
      }
    }, 1000); // Wait for 1 second

    return () => clearTimeout(checkUserWithDelay);
  }, [currentUser, opponent]);

  useEffect(() => {
    if(!opponent){
      setIsFindOpponentOpen(true);
    }
  }, [isUserLoggedIn])

  useEffect(() => {
    const callback = (user: User | null) => {
      if (user) {
        console.log("User has been updated:", user);
        //user has logged in, start now
        if(userLoggedIn){
          setIsUserLoggedIn(true);
        }
      } else {
        console.log("User has been logged out or removed");
      }
    };

    // Register callback to get notified when currentUser changes
    const unregister = onSet(callback);

    // Cleanup is managed automatically when the component unmounts
    return () => {
      unregister(); // Unregister the callback
    };
  }, [onSet]);

  // Function to handle opponent found
  const handleOpponentFound = (opponent: User, room: Room) => {
    setOpponentModalCloseGracefully(true);
    setOpponent(opponent);  
    setRoom(room);
  };

  const handleReady = async () => {
    setIsReady(true);
    setIsCountdownOpen(true); // Open countdown modal
  };

  const handleCountdownClose = async () => {
    setIsReady(false);
    setIsCountdownOpen(false); // Close countdown modal
    setCountdown(3); // Reset countdown start value
    setIsStarted(true);
  };

  const handleFindOpponentClose = async () => {
    setIsFindOpponentOpen(false); // Close countdown modal
  };
  
  const handleCreateRoom = (room: Room) => {
    setRoom(room);
  }
  
  const handleJoinRoom = (room: Room) => {
    room.players.forEach((player : User) => {
      if(player.username !== currentUser?.username){
        setOpponent(player);
      }
    })
    setRoom(room);
  }

  const handleLoginClick = () => {
    setIsUserModalOpen(true);
  }


  return (
    <div>
      <div className={`min-h-screen flex flex-col ${currentUser? '' : 'p-8' } h-full bg-light-background text-light-foreground transition-all duration-500 dark:bg-dark-background dark:text-dark-foreground`}>
        {!currentUser ? (
        <div className="flex flex-col md:flex-row items-center justify-center mb-8 md:mt-12 md:mb-12">
        {/* Left Side - Typing Image */}
        <Image
          src="/storysets/typing.svg"
          alt="KeyMaster"
          className="w-48 h-48 object-contain mr-4"
          height={128}
          width={128}
        />
      
        {/* Middle Section - Title and Subtitle */}
        <div className="text-center md:text-left flex flex-col items-center md:items-start">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-dancing">
            KeyMaster
          </h1>
      
          <h2 className="text-xl md:text-2xl font-dancing mb-4">
            How fast can you type?
          </h2>
      
          {/* Login Call-to-Action */}
          <p className="text-lg md:text-xl font-semibold mb-6">
            Login to compete against your friends!
          </p>
      
          <button onClick={handleLoginClick} className="dark:bg-dark-primary bg-light-primary hover:bg-light-secondary dark:hover:bg-dark-secondary hover:text-dark-background text-light-background font-bold py-2 px-6 rounded-full transition duration-300">
            Login
          </button>
        </div>
      
        {/* Right Side - Compete Image */}
        <Image
          src="/storysets/compete.svg"
          alt="Compete"
          className="w-64 h-64 md:w-80 md:h-80 object-contain ml-4 mt-6 md:mt-0" // Bigger size for the compete image
          height={256}
          width={256}
        />
      </div>
        ) : (
          room && (
            <CompeteRoom 
              room={room} 
              opponent={opponent ? opponent : undefined} 
              currentUser={currentUser} 
              onReady={handleReady} 
              isStarted={isStarted} 
            />
          )
        )}
      </div>
      <CountDown 
         onClose={handleCountdownClose}
         isOpen={isCountdownOpen}  
         count={countdown}
      />
      {(!opponent || opponentModalCloseGracefully) && (
          <FindOpponent
            isOpen={isFindOpponentOpen} 
            onClose={handleFindOpponentClose}
            onOpponentFound={(opponent, room) => handleOpponentFound(opponent, room)}
            onCreateRoom={(room) => handleCreateRoom(room)}
            onJoinRoom={(room) => handleJoinRoom(room)}
           />
      )}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        type="compete"
      />
      
    </div>
  );
};

export default CompetePage;
