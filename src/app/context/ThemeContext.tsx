"use client"
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define a type for the context value
interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Create a custom hook for easy access to the context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Create the ThemeProvider component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }): JSX.Element => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Load the theme from localStorage or system preferences
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      // Use the stored theme if it exists
      setIsDarkMode(storedTheme === 'dark');
    } else {
      // Otherwise, use system preferences
      const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDarkMode);
    }
  }, []);

  // Effect to update the document class and save the theme to localStorage
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
