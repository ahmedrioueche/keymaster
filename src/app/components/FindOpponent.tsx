// components/FindOpponent.tsx

"use client";

import React, { useState, useEffect } from "react";
import { apiCreateRoom, apiFindOpponent, apiJoinRoom } from "../utils/apiHelper"; // Ensure these functions are implemented in your apiHelper
import { useUser } from "../context/UserContext";
import { User } from "../types/types";
import Image from 'next/image';
import { FaRocket, FaSearch, FaSpinner, FaTimes } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface FindOpponentProps {
  isOpen: boolean;
  onClose: () => void;
  onOpponentFound: (opponent: User, text: string) => void;
  onCreateRoom?: (roomId : string) => void;
  onJoinRoom?: (roomId : string) => void;
}

const FindOpponent: React.FC<FindOpponentProps> = ({ isOpen, onClose, onJoinRoom, onCreateRoom }) => {
  const { currentUser } = useUser(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [opponent, setOpponent] = useState<User | null>(null);
  const [textToType, setTextToType] = useState(""); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [isReady, setIsReady] = useState(false);
  const [isCompetitionStarted, setIsCompetitionStarted] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [searching, setSearching] = useState(true);
  const [mode, setMode] = useState<"search" | "join">("search");
  const [roomId, setRoomId] = useState("");
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState<"join" | "create" | "null">("null");
  const router = useRouter();
  
  useEffect(() => {
    if (searching) {
      const findOpponent = async () => {
        try {
          const response = await apiFindOpponent();
          if (response) {
            setOpponent(response.opponent);
            setTextToType(response.text);
            clearTimeout(timeoutId!);
          }
        } catch (error) {
          console.error("Error finding opponent:", error);
        }
      };

      findOpponent();

      // Set a timeout to stop searching after 30 seconds
      const id = setTimeout(() => {
        setSearching(false);
        setOpponent(null);
      }, 30000); // 30 seconds timeout

      setTimeoutId(id);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId); // Clean up timeout on unmount
    };
  }, [searching]);

  const handleReady = () => {
    setIsReady(true);
    if (opponent) {
      setIsCompetitionStarted(true);
    }
  };

  //const handleSearchClick = () => {
  //  setSearching(true);
  //  setOpponent(null); // Reset opponent when starting search
  //};

  const handleJoinRoomClick = async () => {
    if (roomId.trim() === "") {
      alert("Please enter a valid Room ID."); // Simple alert for error
      return;
    }
    setIsLoading("join");
    try {
      const result = await apiJoinRoom(roomId);
      if (result.response.room) {
        // Handle successful room joining
        setOpponent(result.opponent);
        setTextToType(result.text);
        setIsCompetitionStarted(true);
        if(result.response.room){
          onJoinRoom? onJoinRoom(result.response.room.roomId) : null; //eslint-disable-line @typescript-eslint/no-unused-expressions
        }
        onClose();
      } else {
        alert("Failed to join the room. Please check the Room ID.");
      }
    } catch (error) {
      console.error("Error joining the room:", error);
      alert("Error joining the room. Please try again.");
    }
    setIsLoading("null");
  };

  const handleCreateRoomClick = async () => {
    if (roomId.trim() === "") {
      alert("Please enter a valid Room ID."); 
      return;
    }
    setIsLoading("create");
    const result = await apiCreateRoom(roomId);
    if(result.response.room){
      onCreateRoom? onCreateRoom(result.response.room.roomId) : null; //eslint-disable-line @typescript-eslint/no-unused-expressions
    }
    setIsLoading("null");
    onClose();
  }

  const handleTryAgain = () => {
    setSearching(true);
  }

  const handleChangeToJoin = () => {
    setMode("join");
    setSearching(false);
  }

  const handleClose = () => {
    router.push("/")
    onClose();
  }
  
  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-transform duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
      <div className="bg-light-background dark:bg-dark-background rounded-lg shadow-lg p-5 w-full sm:w-[90%] max-w-md max-h-[95vh] overflow-y-auto hide-scrollbar">
      <div className="flex justify-between items-center mb-4">
        <div className="flex-grow flex justify-center">
          <h1 className="text-3xl font-bold mb-4 mt-1 text-light-primary dark:text-dark-primary">
            {mode === "search" ? <span>Find an Opponent</span> : <span>Join a Room</span>}
          </h1>
        </div>
        <button
          onClick={handleClose}
          className="p-2 rounded-full bg-light-background hover:bg-light-accent dark:hover:bg-dark-secondary transition-colors duration-300 text-gray-700"
        >
          <FaTimes size={16} />
        </button>
      </div>
        {/* Storyset Image based on the mode */}
        <div className="flex justify-center mb-4">
          <Image src={mode === "search" ? "/storysets/search.svg" : "/storysets/join.svg"} alt="Add user illustration" className="w-full h-48 object-contain" height={48} width={38} />
        </div>
          
        {mode === "search" ? (
          <>
            <div className="flex justify-center flex-row">
              {searching && <FaSpinner className="animate-spin text-dark-background dark:text-light-background mr-3 mt-1"/>}
              <p className="text-lg text-center text-gray-700 dark:text-gray-300">
                {searching ? `Searching for an opponent...` : opponent ? `Opponent Found: ${opponent.username}` : "No opponent found, please try again later, or invite a friend."}
              </p>
            </div>

            {opponent ? (
              <div className="mt-6 flex flex-col items-center">
                <button
                  className={`bg-light-secondary dark:bg-dark-seondary text-white px-6 py-2 rounded-lg shadow hover:bg-light-primary dark:hover:bg-dark-primary transition duration-200 ${isReady ? "opacity-50" : ""}`}
                  onClick={handleReady}
                  disabled={isReady}
                >
                  {isReady ? "Waiting for Opponent..." : "Ready"}
                </button>
              </div>
            ) : (
              !searching && (
                <div className="mt-6 flex flex-col items-center">
                  <button
                    className={`bg-light-secondary dark:bg-dark-seondary text-dark-background hover:text-light-background px-6 py-2 rounded-lg shadow hover:bg-light-primary dark:hover:bg-dark-primary transition duration-200`}
                    onClick={handleTryAgain}
                  >
                    Try again
                  </button>
                </div>
              )
            )}
           
            {/* Move the Join Room button below the existing buttons */}
            <div className="flex justify-center">
              <button
                className="flex flex-row text-blue-500 text-xl hover:underline hover:text-blue-500 mt-8"
                onClick={() => handleChangeToJoin()}
              >
                <FaRocket className="mr-2 mt-1" size={18}/>
                <span>Join a Room</span>
              </button>
            </div>
          
          </>
        ) : (
          <>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-dark-background font-stix focus:ring-2 focus:ring-light-secondary focus:outline-none focus:border-transparent"
              placeholder="Room ID"
            />
            <div className="mt-6 flex flex-col items-center">
              <div className="flex flex-row justify-between">
                <button
                  className={`mr-8 bg-light-secondary dark:bg-dark-seondary text-dark-background hover:text-light-background px-6 py-2 rounded-lg shadow hover:bg-light-primary dark:hover:bg-dark-primary transition duration-200`}
                  onClick={handleJoinRoomClick}
                >
                  {isLoading === "join"? <FaSpinner className="animate-spin"/> : <span>Join Room</span>}
                </button>
                <button
                  className={`bg-light-secondary dark:bg-dark-seondary text-dark-background hover:text-light-background px-6 py-2 rounded-lg shadow hover:bg-light-primary dark:hover:bg-dark-primary transition duration-200`}
                  onClick={handleCreateRoomClick}
                >
                  {isLoading === "create"? <FaSpinner className="animate-spin"/> : <span>Create Room</span>}
                </button>
              </div>
              <button
                className="flex flex-row text-blue-500 text-xl hover:underline hover:text-blue-500 mt-8"
                onClick={() => setMode("search")}
              >
                <FaSearch className="mr-2 mt-1" size={18}/>
                <span>Search for Opponent</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FindOpponent;

