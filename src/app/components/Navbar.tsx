"use client";

import React, { useEffect, useRef, useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Link from 'next/link';
import { useTheme } from '../context/ThemeContext'; 
import UserModal from './UserModal';
import { FaCog, FaExclamationCircle, FaHome, FaUser } from 'react-icons/fa';
import SettingsModal from './SettingsModal';
import Image from 'next/image';
import { useUser } from '../context/UserContext';

const Navbar: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {currentUser} = useUser();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detect if the device is mobile
  const checkIsMobile = () => {
    const userAgent = typeof window !== 'undefined' ? navigator.userAgent || navigator.vendor : '';
    const isMobileWidth = window.innerWidth <= 768; // You can adjust the breakpoint if needed
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

    // Combine width and device detection for more reliable results
    return isMobileWidth || isMobileDevice;
  };

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(checkIsMobile());
      }
    };

    // Set initial mobile state after the component mounts
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleMenuClick = () => {
    setIsMenuOpen(prev => !prev);
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
    if(isMenuOpen){
      setIsMenuOpen(false);
    }
  }

  const handleSettingsClick = () => {
    if(!currentUser){
      setIsMenuOpen(true);
      return;
    }

    setIsSettingsModalOpen(true);
    if(isMenuOpen){
      setIsMenuOpen(false);
    }
  }
  
  return (
    <nav className="bg-light-background dark:bg-dark-background p-4 shadow">
      <div className="flex justify-between items-center">
        <div className='flex flex-row'>
          <Image
            src="/storysets/typing.svg"
            alt="KeyMaster"
            className="w-8 h-8 object-contain mr-2" 
            height={12} 
            width={12} 
          />
          <h1 className="text-light-foreground dark:text-dark-foreground text-2xl font-bold">
            KeyMaster
          </h1>
        </div>
      

        {isMobile ? (
          <>
            <div>
              {/* Theme Toggle Icon */}
              <button
                onClick={toggleTheme}
                className="text-light-foreground dark:text-dark-foreground focus:outline-none hover:bg-light-accent dark:hover:bg-dark-accent p-2 rounded mr-2"
                aria-label="Toggle Theme"
              >
                {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </button>
              <button
                onClick={handleMenuClick}
                className="text-light-foreground dark:text-dark-foreground focus:outline-none hover:bg-light-accent dark:hover:bg-dark-accent p-2 rounded mr-2"
                aria-label="Menu"
              >
                <MenuIcon />
              </button>
            </div>
       
            {isMenuOpen && (
             <div
             ref={dropdownRef}
             className="md:hidden overflow-y-auto mt-5 z-[100] absolute top-[2.8rem] right-[1.4rem] w-[15.6rem] bg-light-background dark:bg-dark-background border text-dark-background dark:text-light-background border-gray-300 dark:border-gray-600 rounded-lg shadow-lg flex flex-col py-1 space-y-4"
           >
             <div className="flex flex-col items-start w-full space-y-2">
               <Link
                 href="/"
                 className="flex items-center w-full p-4 py-2 text-lg font-medium text-light-text dark:text-dark-text hover:text-dark-text dark:hover:text-light-text hover:bg-light-accent dark:hover:bg-dark-accent dark:hover:text-dark-background transition-colors duration-300"
                 onClick={handleMenuClose}
               >
                 <FaHome className="mr-3 text-lg" /> Home
               </Link>
               <Link
                 href="/"
                 className="flex items-center w-full p-4 py-2 text-lg font-medium text-light-text dark:text-dark-text hover:text-dark-text dark:hover:text-light-text hover:bg-light-accent dark:hover:bg-dark-accent dark:hover:text-dark-background transition-colors duration-300"
                 onClick={handleUserClick}
               > 
                <FaUser className="mr-3 text-lg" /> {currentUser? currentUser?.username : "User"} 
               </Link> 
              
               <Link
                 href="/"
                 className="flex items-center w-full p-4 py-2 text-lg font-medium text-light-text dark:text-dark-text hover:text-dark-text dark:hover:text-light-text hover:bg-light-accent dark:hover:bg-dark-accent dark:hover:text-dark-background transition-colors duration-300"
                 onClick={handleSettingsClick}
               >
                 <FaCog className="mr-3 text-lg" /> Settings
               </Link>
               <Link
                 href="/"
                 className="flex items-center w-full p-4 py-2 text-lg font-medium text-light-text dark:text-dark-text hover:text-dark-text dark:hover:text-light-text hover:bg-light-accent dark:hover:bg-dark-accent dark:hover:text-dark-background transition-colors duration-300"
                 onClick={handleMenuClose}
               >
                 <FaExclamationCircle className="mr-3 text-lg" /> About
               </Link>
               </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-light-foreground dark:text-dark-foreground hover:bg-light-secondary dark:hover:bg-dark-secondary px-4 py-2 text-lg rounded flex items-center">
              <FaHome className="mr-2" /> Home
            </Link>
            <Link onClick={handleUserClick} href="/" className="text-light-foreground dark:text-dark-foreground hover:bg-light-secondary dark:hover:bg-dark-secondary px-4 py-2 text-lg rounded flex items-center">
             <FaUser className="mr-3 text-lg" /> {currentUser? currentUser?.username : "User"}  
            </Link>
            <Link onClick={handleSettingsClick} href="/" className="text-light-foreground dark:text-dark-foreground hover:bg-light-secondary dark:hover:bg-dark-secondary px-4 py-2 text-lg rounded flex items-center">
              <FaCog className="mr-2" /> Settings
            </Link>
            <Link href="/about" className="text-light-foreground dark:text-dark-foreground hover:bg-light-secondary dark:hover:bg-dark-secondary px-4 py-2 text-lg rounded flex items-center">
              <FaExclamationCircle className="mr-2" /> About
            </Link>            
            {/* Theme Toggle Icon */}
            <button
              onClick={toggleTheme}
              className="text-light-foreground dark:text-dark-foreground focus:outline-none hover:bg-light-secondary dark:hover:bg-dark-secondary p-2 rounded"
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
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
