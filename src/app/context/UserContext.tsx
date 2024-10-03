"use client";
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { User } from "../types/types"; // Assuming you have a User type defined

interface UserContextProps {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  onSet: (callback: (user: User | null) => void) => void; // Add onSet method
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [callbackSet, setCallbackSet] = useState<Set<(user: User | null) => void>>(new Set());

  // Notify all registered callbacks when currentUser changes
  useEffect(() => {
    callbackSet.forEach((callback) => callback(currentUser));
  }, [currentUser, callbackSet]); // Include callbackSet as a dependency

  // Function to register a callback
  const onSet = (callback: (user: User | null) => void) => {
    setCallbackSet((prev) => new Set(prev).add(callback)); // Add callback to set
  };

  // Cleanup callbacks on unmount
  useEffect(() => {
    return () => {
      setCallbackSet(new Set()); // Clear callbacks when the provider unmounts
    };
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, onSet }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = (): UserContextProps => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
