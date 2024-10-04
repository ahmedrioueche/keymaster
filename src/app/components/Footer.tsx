"use client";

import React from 'react';
import Link from 'next/link';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="bg-light-background dark:bg-dark-background p-8 shadow-md">
      <div className="flex justify-between items-center">
        <div className="text-light-foreground dark:text-dark-foreground">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} KeyMaster. All rights reserved.
          </p>
        </div>
        <div className="flex space-x-4">
          <Link href="https://github.com/your-username" target="_blank" className="text-light-foreground dark:text-dark-foreground hover:text-light-accent dark:hover:text-dark-accent transition-colors duration-300">
            <FaGithub size={20} />
          </Link>
          <Link href="https://linkedin.com/in/your-profile" target="_blank" className="text-light-foreground dark:text-dark-foreground hover:text-light-accent dark:hover:text-dark-accent transition-colors duration-300">
            <FaLinkedin size={20} />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
