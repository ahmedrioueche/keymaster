"use client";

import React, { useEffect, useState } from "react";
import TypingArea from "./TypingArea"; // Adjust the import path if necessary
import SettingsAndStats from "./Settings"; // Adjust the import path if necessary
import Leaderboard from "./Leaderboard"; // Import the Leaderboard component
import { useTheme } from "../context/ThemeContext"; // Adjust the import path if necessary
import { apiPromptGemini } from "../utils/apiHelper";
import { TypingStat, User } from "../types/types";

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

  useEffect(() => {
    //get users and current user from local storage
    //localStorage.clear();
    const storedUsers = localStorage.getItem("users");
    const users : User[] = storedUsers? JSON.parse(storedUsers) : null;
    if(users){
      setUsers(users);
    }
    const storedUser = localStorage.getItem("currentUser");
    const currentUser : User = storedUser? JSON.parse(storedUser) : null;
    if(currentUser){
      setCurrentUser(currentUser);
    }

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

  const handleTextCompletion = (speed: number) => {
    setIsFinished(true);
    const date = new Date().toLocaleString();
  
    if (currentUser) {
      setUsers((prev) => {
        const updatedUsers = [...(prev || [])];
        const existingUserIndex = updatedUsers.findIndex(user => user.name === currentUser.name);
        let updatedUser: User;
  
        if (existingUserIndex > -1) {
          const existingUser = updatedUsers[existingUserIndex];
          const newEntry: TypingStat = { speed, date };
          const updatedEntries = [...(existingUser.typingStats || []), newEntry];
          const bestSpeedEntry = updatedEntries.reduce((best, entry) =>
            entry.speed > best.speed ? entry : best,
          updatedEntries[0]);
  
          updatedUser = {
            ...existingUser,
            typingStats: updatedEntries,
            speed: bestSpeedEntry.speed,
            lastEntryDate: date,
          };
  
          updatedUsers[existingUserIndex] = updatedUser;
        } else {
          updatedUser = {
            name: currentUser.name,
            speed,
            lastEntryDate: date,
            typingStats: [{ speed, date }],
          };
  
          updatedUsers.push(updatedUser);
        }
  
        const rankedUsers = updatedUsers
          .sort((a, b) => (b.speed ?? 0) - (a.speed ?? 0))
          .map((user, index) => ({ ...user, rank: index + 1 }));
  
        localStorage.setItem("users", JSON.stringify(rankedUsers));
  
        return rankedUsers;
      });
    } else {
      // Prompt the user to enter their name if not set
      const userName = prompt("Enter your name");
  
      if (userName) {
        const newUser : User = {
          name: userName,
          speed,
          lastEntryDate: date,
          typingStats: [{ speed, date }],
        };
  
        setCurrentUser(newUser);
        localStorage.setItem("currentUser", JSON.stringify(newUser));

        setUsers((prev) => {
          const updatedUsers = [...(prev || []), newUser];
  
          const rankedUsers = updatedUsers
            .sort((a, b) => (b.speed ?? 0) - (a.speed ?? 0))
            .map((user, index) => ({ ...user, rank: index + 1 }));
  
          localStorage.setItem("users", JSON.stringify(rankedUsers));

          return rankedUsers;
        });
      }
    }
  };
  
  
  
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

  const TypingStats : TypingStat[] | undefined = currentUser?.typingStats;
  console.log("TypingStats", TypingStats)
  console.log("currentUser", currentUser)

  return (
    <div
      className={`min-h-screen flex flex-col p-4 sm:p-8 h-full ${
        isDarkMode
          ? "bg-dark-background text-dark-foreground"
          : "bg-light-background text-light-foreground"
      } transition-all duration-500`}
    >
      {/* Title - Hidden on small screens */}
      <h1 className="hidden md:block text-4xl font-bold text-center mb-4 font-dancing">
        KeyMaster
      </h1>

      {/* Subtitle - Responsive font size */}
      <h2 className="text-2xl md:text-3xl font-dancing text-center mb-8">
        How type can you fast?
      </h2>

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
        {(!isSmallScreen || isStarted) && (
          <div className="w-full md:w-2/3 lg:w-3/4">
            <TypingArea
              textToType={textToType}
              isStarted={isStarted}
              onComplete={(speed) => handleTextCompletion(speed)}
              onUserTyped={handleUserTyped}
            />
            {/* Leaderboard - Displayed under the Typing Area */}
            <div className="bg-light-secondary dark:bg-dark-secondary">
             <Leaderboard leaderboardData={users} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainContainer;
