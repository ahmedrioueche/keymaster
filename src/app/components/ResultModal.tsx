import React, { useEffect, useState } from 'react';
import { FaSpinner, FaTimes } from 'react-icons/fa';
import { User } from "../types/types";
import { apiAuthenticateUser, apiGetUsers, apiInsertUser } from '../utils/apiHelper';
import Image from 'next/image';
import Alert from './Alert';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ isOpen, onClose }) => {

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-transform duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
    >
      <div className="bg-light-background dark:bg-dark-background rounded-lg shadow-lg p-5 w-full sm:w-[90%] max-w-md max-h-[95vh] overflow-y-auto hide-scrollbar">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-light-foreground dark:text-dark-foreground">
            <Image src='/icons/results.png' height={30} width={30} className="text-3xl mr-3" alt="Profile" />
            <h2 className="text-xl font-bold mt-1 font-dancing">Result</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-light-background hover:bg-light-accent dark:hover:bg-dark-secondary transition-colors duration-300 text-gray-700"
          >
            <FaTimes size={16} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default ResultModal;
