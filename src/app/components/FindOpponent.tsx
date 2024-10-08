// components/FindOpponent.tsx

"use client";

import React, { useState, useEffect } from "react";
import { apiCreateRoom, apiFindOpponent, apiJoinRoom } from "../utils/apiHelper"; // Ensure these functions are implemented in your apiHelper
import { useUser } from "../context/UserContext";
import { Room, SearchPrefs, User } from "../types/types";
import Image from 'next/image';
import { FaRocket, FaSearch, FaSpinner, FaTimes } from "react-icons/fa";
import { useRouter } from "next/navigation";
import CustomizeSearch from "./CustomizeSearch";
import { defaultLanguage, defaultTextLength } from "../utils/settings";

interface FindOpponentProps {
  isOpen: boolean;
  onClose: () => void;
  onOpponentFound: (opponent: User, room: Room) => void;
  onCreateRoom?: (room : Room) => void;
  onJoinRoom?: (roon : Room) => void;
}


const FindOpponent: React.FC<FindOpponentProps> = ({ isOpen, onClose, onJoinRoom, onCreateRoom, onOpponentFound }) => {
  const { currentUser } = useUser(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [opponent, setOpponent] = useState<User | null>(null);
  const [textToType, setTextToType] = useState(""); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [searching, setSearching] = useState(true);
  const [mode, setMode] = useState<"search" | "join">("join");
  const [roomId, setRoomId] = useState("");
  const [isLoading, setIsLoading] = useState<"join" | "create" | "null">("null");
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [searchPrefs, setSearchPrefs] = useState<SearchPrefs>({prefLanguage: defaultLanguage, prefTextMaxLength: defaultTextLength});  
  const [customizeSearchVisible, setCustomizeSearchVisible] = useState(false); //eslint-disable-line @typescript-eslint/no-unused-vars
  const [status, setStatus] = useState<{title : string, message : string}>({title: '', message:''});
  const [isSearchModeAvailable, setIsSearchModeAvailable] = useState(false);//eslint-disable-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let intervalId: ReturnType<typeof setInterval>; 
  
    const findOpponent = async () => {
      try {
        const response = currentUser ? await apiFindOpponent(currentUser, searchPrefs) : null;
        console.log("response", response);
        const result : any = response.response; //eslint-disable-line @typescript-eslint/no-explicit-any
        if (result && result.status === "success") {
          setSearching(false);
          setOpponent(result.opponent);
          onOpponentFound(result.opponent, result.room)
          clearTimeout(timeoutId); 
          clearInterval(intervalId); 
          setTimeout(()=>{
            onClose();
          }, 3000)
        } else {
          console.log("Opponent not found, will try again.");
        }
      } catch (error) {
        console.error("Error finding opponent:", error);
      }
    };
  
    if (searching) {
      // Start polling every 5 seconds
      intervalId = setInterval(findOpponent, 5000); // Adjust the interval as needed
  
      // Set a timeout to stop searching after 30 seconds
      timeoutId = setTimeout(() => {
        setSearching(false);
        setOpponent(null);
        clearInterval(intervalId); // Clear the interval on timeout
      }, 30000); // 30 seconds timeout
  
      // Initial call to find opponent
      findOpponent();
    }
  
    return () => {
      clearTimeout(timeoutId); // Clean up timeout on unmount
      clearInterval(intervalId); // Clean up interval on unmount
    };
  }, [searching, currentUser, searchPrefs]);

  const handleJoinRoomClick = async () => {
    setStatus({title:"", message: ""});
    if (roomId.trim() === "") {
      setStatus({title:"join-room", message: "Please enter a valid Room ID."})
      return;
    }
    setIsLoading("join");
    try {
      const result = currentUser? await apiJoinRoom(roomId, currentUser) : null;
      if (result.response.room) {
        // Handle successful room joining
        setOpponent(result.opponent);
        setTextToType(result.text);
        if(result?.response?.room){
          onJoinRoom? onJoinRoom(result.response.room) : null; //eslint-disable-line @typescript-eslint/no-unused-expressions
          onClose();
        }
      } else {
        setStatus({title:"join-room", message: "Failed to join the room. Please check the Room ID."})
      }
    } catch (error) {
      console.error("Error joining the room:", error);
      setStatus({title:"join-room", message: "Error joining the room. Please try again."})
    }
    setIsLoading("null");
  };

  const handleCreateRoomClick = async () => {
    setStatus({title:"", message: ""});

    if (roomId.trim() === "") {
      setStatus({title:"create-room", message: "Please enter a valid Room ID."})
      return;
    }
    setIsLoading("create");
    try {
      const result = currentUser? await apiCreateRoom(roomId, currentUser) : null;
      if(result?.response?.room){
        onCreateRoom? onCreateRoom(result.response.room) : null; //eslint-disable-line @typescript-eslint/no-unused-expressions
        onClose();
      }
      else {
        setStatus({title:"create-room", message:"Room already exists, please choose another Id"})
      }
    }
    catch{
      setStatus({title:"create-room", message: "Error creating the room. Please try again."})
    }
    setIsLoading("null");
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

  const handleCustomizeSearch = () => {
    setIsCustomizeModalOpen(true);
    setSearching(false);
  }

  const handleCustomizeSearchSave = (prefs: SearchPrefs) => {
    setSearchPrefs(prefs);
    setSearching(true);
    setIsCustomizeModalOpen(false)

  }
  const handleCustomizeSearchClose = () => {
    setIsCustomizeModalOpen(false)
    setSearching(true);
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
          
        {(mode === "search" && isSearchModeAvailable) ?  (
        <>
          <div className="flex flex-col justify-center items-center">
            <div className="flex justify-center flex-row">
              {searching && <FaSpinner className="animate-spin text-dark-background dark:text-light-background mr-3 mt-1" />}
              <p className="text-lg text-center text-gray-700 dark:text-gray-300">
                {searching ? (
                  `Searching for an opponent...`
                ) : opponent ? (
                  <>
                    <span className="text-2xl font-bold text-dark-primary dark:text-light-primary">
                      Opponent Found: {opponent.username}
                    </span>
                  </>
                ) : (
                  "No opponent found, please try again later, or invite a friend."
                )}
              </p>
            </div>
            {searching && !opponent && (
              customizeSearchVisible && (
                <button
                    className={`mt-6 bg-light-secondary dark:bg-dark-seondary text-dark-background hover:text-light-background px-6 py-2 rounded-lg shadow hover:bg-light-primary dark:hover:bg-dark-primary transition duration-200`}
                    onClick={handleCustomizeSearch}
                  >
                    Customize Search
                </button>
              )
            )}
         
            {opponent ? (
              <div className="mt-6 flex flex-row items-center">
                <FaSpinner className="animate-spin text-dark-background dark:text-light-background mr-3 mt-1" />
                <span className="text-lg text-dark-background dark:text-light-background">Joining Room</span>
              </div>
            ) : (
              !searching && (
                <div className="mt-6 flex flex-row justify-center space-x-4"> {/* Flex container with spacing */}
                <button
                  className={`bg-light-secondary dark:bg-dark-seondary text-dark-background hover:text-light-background px-6 py-2 rounded-lg shadow hover:bg-light-primary dark:hover:bg-dark-primary transition duration-200`}
                  onClick={handleTryAgain}
                >
                  Try again
                </button>
                {customizeSearchVisible && (
                  <button
                    className={`bg-light-secondary dark:bg-dark-seondary text-dark-background hover:text-light-background px-6 py-2 rounded-lg shadow hover:bg-light-primary dark:hover:bg-dark-primary transition duration-200`}
                    onClick={handleCustomizeSearch}
                  >
                    Customize Search
                </button>
                )}
              </div>              
              )
            )}
          </div>

          {!opponent && (
          <div className="flex justify-center">
            <button
              className="flex flex-row text-blue-500 text-xl hover:underline hover:text-blue-500 mt-6"
              onClick={() => handleChangeToJoin()}
            >
              <FaRocket className="mr-2 mt-1" size={18} />
              <span>Join a Room</span>
            </button>
          </div>
          )}
        
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
            {status && (
              <div className='text-red-500 dark:text-dark-secondary text-lg mt-2 flex justify-center'>
                {status.message}
              </div>
            )}
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
              {isSearchModeAvailable && (
                <button
                  className="flex flex-row text-blue-500 text-xl hover:underline hover:text-blue-500 mt-6"
                  onClick={() => setMode("search")}
                >
                  <FaSearch className="mr-2 mt-1" size={18}/>
                  <span>Search for Opponent</span>
              </button>
              )}
           
            </div>
          </>
        )}
      </div>
      <CustomizeSearch
        isOpen={isCustomizeModalOpen}
        onClose={()=> handleCustomizeSearchClose()}
        onSave={(prefs)=> handleCustomizeSearchSave(prefs)}
      />
    </div>
  );
};

export default FindOpponent;

