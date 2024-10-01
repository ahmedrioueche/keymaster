"use client"
import React, { useEffect, useRef, useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Link from 'next/link';
import { useTheme } from '../context/ThemeContext'; 

const Navbar: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

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
                    <Link href="/lessons" className="block px-4 py-2 text-light-foreground dark:text-dark-foreground hover:bg-gray-200 dark:hover:bg-gray-700">Lessons</Link>
                  </li>
                  <li onClick={handleMenuClose}>
                    <Link href="/practice" className="block px-4 py-2 text-light-foreground dark:text-dark-foreground hover:bg-gray-200 dark:hover:bg-gray-700">Practice</Link>
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
            <Link href="/lessons" className="text-light-foreground dark:text-dark-foreground hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 text-lg rounded">Lessons</Link>
            <Link href="/practice" className="text-light-foreground dark:text-dark-foreground hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 text-lg rounded">Practice</Link>
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
    </nav>
  );
};

export default Navbar;
