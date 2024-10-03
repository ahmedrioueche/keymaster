"use client";
import React, { createContext, useState, useContext, useEffect, ReactNode, useRef } from "react";
import { User } from "../types/types"; // Assuming you have a User type defined

interface UserContextProps {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  onSet: (callback: (user: User | null) => void) => () => void; // Correctly specify the return type of onSet
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const callbacksRef = useRef<Set<(user: User | null) => void>>(new Set()); // Use ref to hold callbacks

  // Notify all registered callbacks when currentUser changes
  useEffect(() => {
    // Call each registered callback with the new currentUser value
    callbacksRef.current.forEach((callback) => callback(currentUser));
  }, [currentUser]); // Run only when currentUser changes

  // Function to register a callback
  const onSet = (callback: (user: User | null) => void) => {
    callbacksRef.current.add(callback); // Add callback to the ref

    // Return a cleanup function to remove the callback
    return () => {
      callbacksRef.current.delete(callback); // Cleanup
    };
  };

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
