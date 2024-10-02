"use client";

import React, { useEffect, useRef, useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Link from 'next/link';
import { useTheme } from '../context/ThemeContext'; 
import UserModal from './UserModal';

const Navbar: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(false); // Initially set to false
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth <= 640);
      }
    };

    // Set isMobile state after the component has mounted on the client
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUserClick = () => {
    setIsUserModalOpen(true);
  }

  return (
    <nav className="bg-light-background dark:bg-dark-background p-4 shadow">
      <div className="flex justify-between items-center">
        <h1 className="text-light-foreground dark:text-dark-foreground text-2xl font-bold">
          KeyMaster
        </h1>

        {isMobile ? (
          <>
            <div>
              {/* Theme Toggle Icon */}
              <button
                onClick={toggleTheme}
                className="text-light-foreground dark:text-dark-foreground focus:outline-none hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded mr-2"
                aria-label="Toggle Theme"
              >
                {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </button>
              <button
                onClick={handleMenuClick}
                className="text-light-foreground dark:text-dark-foreground focus:outline-none hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded mr-2"
                aria-label="Menu"
              >
                <MenuIcon />
              </button>
            </div>
       
            {isMenuOpen && (
              <div ref={dropdownRef} className="absolute right-0 mt-2 p-10 bg-light-background dark:bg-dark-background rounded-md shadow-lg z-10">
                <ul className="flex flex-col p-10">
                  <li onClick={handleMenuClose}>
                    <Link href="/" className="block px-4 py-2 text-light-foreground dark:text-dark-foreground hover:bg-gray-200 dark:hover:bg-gray-700">Home</Link>
                  </li>
                  <li onClick={handleMenuClose}>
                    <Link href="/" className="block px-4 py-2 text-light-foreground dark:text-dark-foreground hover:bg-gray-200 dark:hover:bg-gray-700">User</Link>
                  </li>
                  <li onClick={handleMenuClose}>
                    <Link href="/lessons" className="block px-4 py-2 text-light-foreground dark:text-dark-foreground hover:bg-gray-200 dark:hover:bg-gray-700">Lessons</Link>
                  </li>
                  <li onClick={handleMenuClose}>
                    <Link href="/" className="block px-4 py-2 text-light-foreground dark:text-dark-foreground hover:bg-gray-200 dark:hover:bg-gray-700">Settings</Link>
                  </li>
                  <li onClick={handleMenuClose}>
                    <Link href="/about" className="block px-4 py-2 text-light-foreground dark:text-dark-foreground hover:bg-gray-200 dark:hover:bg-gray-700">About</Link>
                  </li>
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-light-foreground dark:text-dark-foreground hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 text-lg rounded">Home</Link>
            <Link onClick={handleUserClick} href="/" className="text-light-foreground dark:text-dark-foreground hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 text-lg rounded">User</Link>
            <Link href="/lessons" className="text-light-foreground dark:text-dark-foreground hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 text-lg rounded">Lessons</Link>
            <Link onClick={handleUserClick} href="/" className="text-light-foreground dark:text-dark-foreground hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 text-lg rounded">Settings</Link>
            <Link href="/about" className="text-light-foreground dark:text-dark-foreground hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 text-lg rounded">About</Link>
            
            {/* Theme Toggle Icon */}
            <button
              onClick={toggleTheme}
              className="text-light-foreground dark:text-dark-foreground focus:outline-none hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </button>
          </div>
        )}
      </div>
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
