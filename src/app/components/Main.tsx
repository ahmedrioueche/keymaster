"use client";

import React, { useEffect, useState } from "react";
import TypingArea from "./TypingArea"; 
import Menu from "./Menu"; 
import Leaderboard from "./Leaderboard"; 
import { apiGetUsers, apiUpdateUser } from "../utils/apiHelper";
import { TypingStat, User } from "../types/types";
import UserModal from "./UserModal";
import Image from 'next/image';
import ResultModal from "./ResultModal";
import { useUser } from "../context/UserContext";
import { defaultTextLength } from "../utils/settings";
import { helperPromptGemini } from "../utils/helper";

const MainContainer: React.FC = () => {
  const {currentUser, setCurrentUser, onSet, userLoggedIn, setUserLoggedIn} = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [textToType, setTextToType] = useState('Press "Start" button to start typing');
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [userTyped, setUserTyped] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [language, setLanguage] = useState("English");
  const [topic, setTopic] = useState("General");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const userSettings = currentUser?.settings;
  const usertextLength = userSettings?.textLength? userSettings.textLength : null;
  const textLength = usertextLength? usertextLength : defaultTextLength;

  useEffect(() => {  
    getUsers();
  }, [])

  const handleStart = async () => {
    if(!currentUser){
      // If currentUser is not set, ask for the user's name
      setIsUserModalOpen(true);
      return;
    }

    setIsStarted(true); // Enable the typing area
    setTextToType("Loading Text...");
    console.log("currentUser", currentUser)

    const response = await helperPromptGemini(textLength, language, topic);
    if (response) {
      setTextToType(response);
    }

  };

 const handleTextCompletion = async (speed: number) => {
  setIsNewRecord(false); // Track if a new record has been set
  
  // Check if the mode is manual or auto
  if (userSettings?.mode === "manual") {
    setIsFinished(true);
  } else {
    handleStart(); // Continue to the next typing session if in auto mode
  }

  const date = new Date().toLocaleString();
  let updatedUser: User;

  setUsers((prevUsers) => {
    const updatedUsers = Array.isArray(prevUsers) ? [...prevUsers] : [];

    if (currentUser) {
      setIsResultModalOpen(true);
      setTimeout(() => {
        setIsResultModalOpen(false);
      }, 3000);

      // Find the current user in the users list
      const existingUserIndex = updatedUsers.findIndex(
        (user) => user.username === currentUser.username
      );

      // If user exists, proceed with the update
      if (existingUserIndex > -1) {

        // Create a new entry for the typing stat
        const newEntry: TypingStat = { speed, date };

        // Append the new entry to their typingStats
        const updatedTypingStats = [...(currentUser.typingStats || []), newEntry];

        // Determine if the current speed is a new record (personal best)
        if(currentUser?.speed){
          if (speed > currentUser.speed) {
            setIsNewRecord(true);
          }
        }
  

        // Update the user object with new stats and best speed
        updatedUser = {
          ...currentUser,
          typingStats: updatedTypingStats,
          speed: currentUser.speed? Math.max(currentUser.speed, speed) : speed, // Ensure the speed is the highest value
          lastEntryDate: date,
        };

        // Update the user in the array
        updatedUsers[existingUserIndex] = updatedUser;
      } else {
        // If the user does not exist in the list, create a new user
        const newEntry: TypingStat = { speed, date };
        updatedUser = {
          username: currentUser.username,
          speed,
          lastEntryDate: date,
          typingStats: [newEntry],
        };

        // Add the new user to the users array
        updatedUsers.push(updatedUser);
      }

      // Sort and rank users based on their best speed
      const rankedUsers = updatedUsers
        .sort((a, b) => (b.speed ?? 0) - (a.speed ?? 0))
        .map((user, index) => ({ ...user, rank: index + 1 }));

      // Find the updated current user in rankedUsers to get their new rank
      const updatedCurrentUser = rankedUsers.find(
        (user) => user.username === currentUser.username
      );

      if (updatedCurrentUser) {
        // Update the current user state with the new rank and updated stats
        setCurrentUser(updatedCurrentUser);
        localStorage.setItem("currentUser", JSON.stringify(updatedCurrentUser));
      }

      // Update the users array with ranked users
      setUsers(rankedUsers);

      return rankedUsers;
    }

    return prevUsers;
  });
};

    
  useEffect(() => {
    //update the user's data in db
    const updateUser = async () => {
      if(currentUser){
        const response = currentUser?.id? await apiUpdateUser(currentUser?.id, {...currentUser}) : null;
        console.log("response", response)
      }
    }

    updateUser();
  
  }, [currentUser])

  const handleUserTyped = () => {
    setUserTyped(true);
  };

  useEffect(() => {
    const handleResize = () => {
        setIsSmallScreen(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
        window.removeEventListener('resize', handleResize);
    };
}, []);

  setTimeout(() => {
    //getUsers();
  }, 30000)

  const getUsers = async () => {
    const response = await apiGetUsers();
    console.log("response", response);
    if(response){
      setUsers(response);
    }
  }
  
  useEffect(() => {
    const callback = (user: User | null) => {
      if (user) {
        console.log("User has been updated:", user);
        //user has logged in, start now
        if(userLoggedIn){ 
          handleStart();
          setUserLoggedIn(false);
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
  
  const handleStop = () => {
    if(userSettings?.mode === "auto"){

    }
  }

  const TypingStats : TypingStat[] | undefined = currentUser?.typingStats;

  return (
    <div
      className={`min-h-screen flex flex-col p-4 sm:p-8 h-full dark:bg-dark-background dark:text-dark-foreground
        bg-light-background text-light-foreground transition-all duration-500`}
    >
      <div className="flex flex-row items-center justify-center mb-6">
        <Image
          src="/storysets/typing.svg"
          alt="KeyMaster"
          className="w-38 h-38 object-contain mr-4" // Adjust size as needed
          height={128} // Adjust height to match your design
          width={128} // Adjust width to match your design
        />
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 font-dancing">
            KeyMaster
          </h1>
  
          {/* Subtitle - Responsive font size */}
          <h2 className="text-xl md:text-3xl font-dancing">
            How fast can you type?
          </h2>
        </div>
      </div>
  
      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row flex-grow">
        {/* Settings and Stats - Full width on small screens, 1/3 width on large screens */}
        <div className="w-full md:w-1/3 lg:w-1/4 mb-8 md:mb-0 md:mr-4">
          <Menu
            onStart={handleStart}
            userTyped={userTyped}
            isFinished={isFinished}
            language={language}
            onStop={handleStop}
            setLanguage={setLanguage}
            topic={topic}
            setTopic={setTopic}
            typingStats={TypingStats}
          />
        </div>
  
        {/* Typing Area and Leaderboard - Wrapped in a flex container for alignment */}
        <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col">
          {/* Typing Area - Always rendered but conditionally enabled */}
          {(!isSmallScreen || isStarted) && (
            <div className="flex-grow">
              <TypingArea
                textToType={textToType}
                isStarted={isStarted}
                onComplete={(speed) => handleTextCompletion(speed)}
                onUserTyped={handleUserTyped}
              />
            </div>
          )}
          {/* Leaderboard - Displayed under the Typing Area */}
          <div className="bg-light-secondary dark:bg-dark-secondary">
            <Leaderboard leaderboardData={users} />
          </div>
        </div>
      </div>
  
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
      />
      {currentUser && (
        <ResultModal
          isOpen={isResultModalOpen}
          onClose={() => setIsResultModalOpen(false)}
          user={currentUser}
          isNewRecord={isNewRecord}
        />
      )}
    </div>
  );  
};

export default MainContainer;
