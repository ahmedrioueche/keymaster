// pages/compete/page.tsx

"use client";

import React, { useState } from "react";
import FindOpponent from "../../components/FindOpponent";
import CompeteRoom from "../../components/CompeteRoom";
import { UserProvider } from "../../context/UserContext";
import { User } from "../../types/types";
import CountDown from "@/app/components/Countdown";
import { helperPromptGemini } from "@/app/utils/helper";

const CompetePage: React.FC = () => {
 // const user = {
 //   username: "Ahmed",
 // };
  const [opponent, setOpponent] = useState<User | null>();
  const [textToType, setTextToType] = useState<string>("Press Ready button to start");
  const [isReady, setIsReady] = useState<boolean>(false); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [countdown, setCountdown] = useState<number>(3); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [isCountdownOpen, setIsCountdownOpen] = useState<boolean>(false);
  const [countdownStart, setCountdownStart] = useState<number>(3);  // eslint-disable-line @typescript-eslint/no-unused-vars
  const [language, setLanguage] = useState("english");  // eslint-disable-line @typescript-eslint/no-unused-vars
  const [topic, setTopic] = useState("general");  // eslint-disable-line @typescript-eslint/no-unused-vars
  const [textLength, setTextLength] = useState(100); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [isPromptedGemini, setIsPromptedGemini] = useState<boolean>(false);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isFindOpponentOpen, setIsFindOpponentOpen] = useState<boolean>(opponent? false : true);
  const [roomId, setRoomId] = useState('');

  // Function to handle opponent found
  const handleOpponentFound = (opponent: User, text: string) => {
    setOpponent(opponent);
    setIsFindOpponentOpen(false);
    setTextToType(text);
  };

  const handleReady = async () => {
    setIsReady(true);
    setCountdownStart(3); // Reset countdown start value
    setIsCountdownOpen(true); // Open countdown modal
    if(!isPromptedGemini){
      const response = await helperPromptGemini(textLength, language, topic);
      if(response){
        setTextToType(response);
      }
      setIsPromptedGemini(true);
    }
  };

  const handleCountdownClose = async () => {
    setIsCountdownOpen(false); // Close countdown modal
    setIsStarted(true);
  };
  const handleFindOpponentClose = async () => {
    setIsFindOpponentOpen(false); // Close countdown modal
  };
  
  const handleCreateRoom = (roomId: string) => {
    console.log("roomId in handleCreateRoom", roomId)
    setRoomId(roomId);
  }
  
  const handleJoinRoom = (roomId: string) => {
    console.log("roomId in handleJoinRoom", roomId)
    setRoomId(roomId);
  }

  return (
    <UserProvider>
      <div className="min-h-screen flex flex-col h-full bg-light-background text-light-foreground transition-all duration-500 dark:bg-dark-background dark:text-dark-foreground">
        {roomId && (
          <CompeteRoom roomId={roomId} opponent={opponent? opponent : undefined} textToType={textToType} currentUser={null} onReady={handleReady} isStarted={isStarted} />
        )}
      </div>
      <CountDown 
         onClose={handleCountdownClose}
         isOpen={isCountdownOpen}  
         count={countdown}
      />
      {!opponent && (
          <FindOpponent
            isOpen={isFindOpponentOpen} 
            onClose={handleFindOpponentClose}
            onOpponentFound={(opponent, text) => handleOpponentFound(opponent, text)}
            onCreateRoom={(roomId) => handleCreateRoom(roomId)}
            onJoinRoom={(roomId) => handleJoinRoom(roomId)}
           />
      )}
    </UserProvider>
  );
};

export default CompetePage;
