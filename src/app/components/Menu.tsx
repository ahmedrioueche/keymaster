"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { TypingStat } from '../types/types';

interface MenuProps {
  onStart: () => void;
  userTyped: boolean;
  isFinished: boolean;
  language: string;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  topic: string;
  setTopic: React.Dispatch<React.SetStateAction<string>>;
  typingStats?: TypingStat[]; // Optional array of typing statistics
}

const Menu: React.FC<MenuProps> = ({
  onStart,
  userTyped,
  isFinished,
  language,
  setLanguage,
  topic,
  setTopic,
  typingStats, 
}) => {
  const { isDarkMode } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isTypingStatsCollapsed, setIsTypingStatsCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [timerVisible, setTimerVisible] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTypingStart = () => {
    if (!timerVisible) {
      setTimerVisible(true);
    }

    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000); // Update timer every second
    }
  };


  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth <= 640;
      setIsMobile(newIsMobile);
      if (!newIsMobile) {
        setIsCollapsed(false);
        setIsTypingStatsCollapsed(false); // Reset typing stats collapse
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleCollapse = () => {
    if (isMobile) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const handleStart = () => {
    onStart();
    setIsCollapsed(true);
    setIsStarted(true);
  };

  const handleStop = () => {
    setIsStarted(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => {
    if (userTyped) {
      setTimeElapsed(0); // Reset the timer when the user starts
      handleTypingStart(); // Start the timer on the first keypress
    }
  }, [userTyped]);

  // Convert time elapsed into hours, minutes, and seconds
  const formatTimeElapsed = () => {
    const hours = Math.floor(timeElapsed / 3600);
    const minutes = Math.floor((timeElapsed % 3600) / 60);
    const seconds = timeElapsed % 60;

    return `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`;
  };

  useEffect(() => {
    if (isFinished) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setIsStarted(false);
    }
  }, [isFinished]);
  
  // Calculate overall speed from typing stats
  const averageSpeed =
    typingStats && typingStats.length > 0
      ? typingStats.reduce((sum, stat) => sum + stat.speed, 0) / typingStats.length
      : 0;

  return (
    <div
      className={`w-full max-w-4xl mx-auto transition-all duration-300 ${
        isDarkMode
          ? 'bg-dark-secondary text-dark-foreground'
          : 'bg-light-secondary text-light-foreground'
      } rounded-lg shadow-md overflow-hidden`}
    >
      <div className="flex justify-between items-center p-4 py-3">
        {!isStarted? (
          <button
          onClick={handleStart}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors duration-300 ${
            isDarkMode
              ? 'bg-dark-primary text-dark-foreground hover:bg-dark-background'
              : 'bg-light-primary text-dark-foreground hover:bg-light-background'
          }`}
          >
          Start
          </button>
        ) : (
          <button
          onClick={handleStop}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors duration-300 ${
            isDarkMode
              ? 'bg-dark-primary text-dark-foreground hover:bg-dark-background'
              : 'bg-light-primary text-dark-foreground hover:bg-dark-background'
          }`}
        >
          Stop
        </button>
        )}
       
        {timerVisible && (
          <div className="flex-1 flex justify-center">
            <p className="text-lg font-bold">{formatTimeElapsed()}</p>
          </div>
        )}
        {isMobile && (
          <button
            onClick={toggleCollapse}
            className="text-light-foreground dark:text-dark-foreground focus:outline-none"
          >
            {isCollapsed ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />}
          </button>
        )}
      </div>
      {(!isMobile || !isCollapsed) && (
        <div className="p-3 py-1">
          <div className="flex flex-col sm:flex-row mb-3">
            <div className="w-full sm:w-1/2 pr-0 sm:pr-2 mb-3 sm:mb-0">
              <label htmlFor="language" className="block text-xs mb-1 font-bold">
                Language
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`w-full p-1 text-sm rounded ${
                  isDarkMode ? 'bg-dark-background' : 'bg-light-background'
                }`}
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Chinese">Chinese</option>
                <option value="Japanese">Japanese</option>
                <option value="Russian">Russian</option>
                <option value="Italian">Italian</option>
                <option value="Portuguese">Portuguese</option>
                <option value="Arabic">Arabic</option>
              </select>
            </div>
            <div className="w-full sm:w-1/2 pl-0 sm:pl-2">
              <label htmlFor="topic" className="block text-xs mb-1 font-bold">
                Topic
              </label>
              <select
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className={`w-full p-1 text-sm rounded ${
                  isDarkMode ? 'bg-dark-background' : 'bg-light-background'
                }`}
              >
                <option value="General">General</option>
                <option value="Technology">Technology</option>
                <option value="Science">Science</option>
                <option value="Health">Health</option>
                <option value="Education">Education</option>
                <option value="Finance">Finance</option>
                <option value="Travel">Travel</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Sports">Sports</option>
                <option value="Entertainment">Entertainment</option>
              </select>
            </div>
          </div>

          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold mb-2 font-stix">Typing Stats</h2>
              {typingStats && typingStats.length > 0 && (
              <button
                onClick={() => setIsTypingStatsCollapsed(!isTypingStatsCollapsed)}
                className="text-light-foreground dark:text-dark-foreground focus:outline-none mb-2"
              >
                {isTypingStatsCollapsed ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />}
              </button>
              )}
            </div>

            {/* Always show Average speed */}
            <p className="text-sm mb-1">Average Speed: {averageSpeed.toFixed(2)} WPM</p>

            {/* Show detailed stats if not collapsed */}
            {!isTypingStatsCollapsed && typingStats && (
            <div style={{ maxHeight: '200px', overflowY: 'auto' }} className="bg-light-background dark:bg-dark-background p-2 rounded-md border border-light-secondary dark:border-dark-secondary">
              {typingStats.map((stat, index) => (
                <div key={index} className="flex justify-between py-1">
                  <p className="text-sm">
                    Recorded Speed: {stat.speed} WPM on {new Date(stat.date).toLocaleDateString()} {new Date(stat.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
