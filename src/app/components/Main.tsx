"use client";

import React, { useEffect, useState } from "react";
import TypingArea from "./TypingArea"; // Adjust the import path if necessary
import SettingsAndStats from "./Menu"; // Adjust the import path if necessary
import Leaderboard from "./Leaderboard"; // Import the Leaderboard component
import { useTheme } from "../context/ThemeContext"; // Adjust the import path if necessary
import { apiGetUsers, apiPromptGemini, apiUpdateUser } from "../utils/apiHelper";
import { TypingStat, User } from "../types/types";
import UserModal from "./UserModal";
import Image from 'next/image';

const MainContainer: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>();
  const [users, setUsers] = useState<User[]>([]);
  const [textToType, setTextToType] = useState('Press "Start" button to start typing');
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [userTyped, setUserTyped] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const { isDarkMode } = useTheme();
  const [language, setLanguage] = useState("English");
  const [topic, setTopic] = useState("General");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  useEffect(() => {
    //get current user
    //localStorage.clear();
    const storedUser = localStorage.getItem("currentUser");
    const currentUser : User = storedUser? JSON.parse(storedUser) : null;
    if(currentUser){
      setCurrentUser(currentUser);
    }
    
    //get users
    getUsers();

  }, [])

  const handleStart = async () => {
    setIsStarted(true); // Enable the typing area
    setTextToType("Loading Text...");
    console.log("Starting with:", { language, topic });
    const prompt = `With no introductions nor conclusions, give a paragraph of 40 letters (including spaces)
                    in a ${topic} topic in ${language} language, do not exceed the required length.`;
    const response = await apiPromptGemini(prompt);
    console.log("response:", response);
    if (response) {
      setTextToType(response);
    }
  };

  const handleTextCompletion = async (speed: number) => {
    setIsFinished(true);
    const date = new Date().toLocaleString();
    let updatedUser: User;

    setUsers((prevUsers) => {
        // Ensure prevUsers is an array or initialize as an empty array
        const updatedUsers = Array.isArray(prevUsers) ? [...prevUsers] : [];

        if (currentUser) {
            // Find the current user in the users list
            const existingUserIndex = updatedUsers.findIndex(
                (user) => user.username === currentUser.username
            );

            // Create a new entry for the typing stat
            const newEntry: TypingStat = { speed, date };

            if (existingUserIndex > -1) {
                // If the user already exists, update their stats
                const existingUser = updatedUsers[existingUserIndex];

                // Append the new entry to their typingStats
                const updatedTypingStats = [...(existingUser.typingStats || []), newEntry];

                // Determine the best speed
                const bestSpeedEntry = updatedTypingStats.reduce(
                    (best, entry) => (entry.speed > best.speed ? entry : best),
                    updatedTypingStats[0]
                );

                // Update the user object with new stats
                updatedUser = {
                    ...existingUser,
                    typingStats: updatedTypingStats,
                    speed: bestSpeedEntry.speed,
                    lastEntryDate: date,
                };

                // Update the user in the array
                updatedUsers[existingUserIndex] = updatedUser;
            } else {
                // If the user does not exist in the list, create a new user
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

            // Update the current user state with the updated user
            setCurrentUser(updatedUser);
            setUsers(rankedUsers);

            return rankedUsers;
        } else {
            // If currentUser is not set, ask for the user's name
            setIsUserModalOpen(true);
        }

        return prevUsers;
    });

    // Update user data in the backend
    if (currentUser) {
        const response = currentUser?.id? await apiUpdateUser(currentUser?.id, { ...currentUser }) : null;
        console.log("Backend response after updating user:", response);
    }
};

  
  useEffect(() => {
    //update the user's data in db
    const updateUser = async () => {
      console.log("currentUser", currentUser)
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

  //setTimeout(() => {
  //  getUsers();
  //}, 10000)

  const getUsers = async () => {
    const response = await apiGetUsers();
    console.log("response", response);
    if(response){
      setUsers(response);
    }
  }

  useEffect(() => {
    if (currentUser) {
      const updatedUser = {
         ...currentUser,
          username: currentUser.username,
      };

      // Set the current user to the new user
      localStorage.setItem("currentUser", JSON.stringify(currentUser));

      // Add the new user to the users array
      users.push(updatedUser);
    }
  }, [currentUser]);
  
  const TypingStats : TypingStat[] | undefined = currentUser?.typingStats;

  return (
    <div
      className={`min-h-screen flex flex-col p-4 sm:p-8 h-full ${
        isDarkMode
          ? "bg-dark-background text-dark-foreground"
          : "bg-light-background text-light-foreground"
      } transition-all duration-500`}
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
        How type can you fast?
      </h2>
    </div>
  </div>


     
    

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row flex-grow">
        {/* Settings and Stats - Full width on small screens, 1/3 width on large screens */}
        <div className="w-full md:w-1/3 lg:w-1/4 mb-8 md:mb-0 md:mr-4">
          <SettingsAndStats
            onStart={handleStart}
            userTyped={userTyped}
            isFinished={isFinished}
            language={language}
            setLanguage={setLanguage}
            topic={topic}
            setTopic={setTopic}
            typingStats={TypingStats}
          />
        </div>

        {/* Typing Area - Always rendered but conditionally enabled */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            {(!isSmallScreen || isStarted) && (
              <TypingArea
                textToType={textToType}
                isStarted={isStarted}
                onComplete={(speed) => handleTextCompletion(speed)}
                onUserTyped={handleUserTyped}
              />
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
        onSetUser={(user) => setCurrentUser(user)}
      />
    </div>
  );
};

export default MainContainer;
