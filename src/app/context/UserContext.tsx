"use client"
import React, { createContext, useState, useContext, useEffect, ReactNode, useRef } from "react";
import { User } from "../types/types";

interface UserContextProps {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  onSet: (callback: (user: User | null) => void) => () => void;
  userLoggedIn: boolean;
  setUserLoggedIn: (loggedIn: boolean) => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false); // Add flag to the context

  const callbacksRef = useRef<Set<(user: User | null) => void>>(new Set());

  useEffect(() => {
    callbacksRef.current.forEach((callback) => callback(currentUser));
  }, [currentUser]);

  const onSet = (callback: (user: User | null) => void) => {
    callbacksRef.current.add(callback);
    return () => {
      callbacksRef.current.delete(callback);
    };
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, onSet, userLoggedIn, setUserLoggedIn }}>
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
