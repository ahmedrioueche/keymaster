"use client";

import React, { useEffect, useState } from "react";
import TypingArea from "./TypingArea"; // Adjust the import path if necessary
import SettingsAndStats from "./Settings"; // Adjust the import path if necessary
import Leaderboard from "./Leaderboard"; // Import the Leaderboard component
import { useTheme } from "../context/ThemeContext"; // Adjust the import path if necessary
import { apiPromptGemini } from "../utils/apiHelper";
import { TypingStat } from "../types/types";

const MainContainer: React.FC = () => {
  const [textToType, setTextToType] = useState('Press "Start" button to start typing');
  const [isStarted, setIsStarted] = useState(false);
  const [userTyped, setUserTyped] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const { isDarkMode } = useTheme();
  const [language, setLanguage] = useState("English");
  const [topic, setTopic] = useState("General");

  // Leaderboard state
  const [leaderboardData, setLeaderboardData] = useState([
    { rank: 1, name: "Alice", speed: 85, date: "2024-09-25" },
    { rank: 2, name: "Bob", speed: 78, date: "2024-09-22" },
    { rank: 3, name: "Charlie", speed: 90, date: "2024-09-20" },
  ]);  

  const handleStart = async () => {
    setIsStarted(true); // Enable the typing area
    console.log("Starting with:", { language, topic });
    const prompt = `With no introductions nor conclusions, give a paragraph of 150 letters (including spaces)
                    in a ${topic} topic in ${language} language, do not exceed the required length.`;
    const response = await apiPromptGemini(prompt);
    console.log("response:", response);
    if (response) {
      setTextToType(response);
    }
  };

  const handleTextCompletion = (speed: number) => {
    console.log("speed in handleTextCompletion", speed);
    
    // Add the player's result to the leaderboard
    const playerName = prompt("Enter your name:");
    const date = new Date().toLocaleDateString();
    if (playerName) {
      setLeaderboardData((prev) => [
        ...prev,
        { rank: 0, name: playerName, speed, date },
      ]);
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

  const TypingStats : TypingStat[] = []

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
      <h2 className="text-xl md:text-2xl font-stix text-center mb-8">
        Improve your typing speed and master the keyboard!
      </h2>

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row flex-grow">
        {/* Settings and Stats - Full width on small screens, 1/3 width on large screens */}
        <div className="w-full md:w-1/3 lg:w-1/4 mb-8 md:mb-0 md:mr-4">
          <SettingsAndStats
            onStart={handleStart}
            userTyped={userTyped}
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
              onComplete={(speed) => handleTextCompletion(speed)}
              onUserTyped={handleUserTyped}
            />
            {/* Leaderboard - Displayed under the Typing Area */}
            <div className="bg-gray-300 dark:bg-gray-500">
             <Leaderboard leaderboardData={leaderboardData} />

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainContainer;
