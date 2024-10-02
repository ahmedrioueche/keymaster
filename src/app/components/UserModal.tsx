import React, { useEffect, useState } from 'react';
import { FaTimes, FaUser, FaUserPlus } from 'react-icons/fa';
import { User } from "../types/types";
import { apiInsertUser } from '../utils/apiHelper';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose }) => {
  const [currentUser, setCurrentUser] = useState<string | null>(null); // Store the current user
  const [isEditing, setIsEditing] = useState(false); // Track if user is adding/changing

  useEffect(() => {
    // Get users and current user from local storage
    const storedUser = localStorage.getItem("currentUser");
    const currentUser: User = storedUser ? JSON.parse(storedUser) : null;
    if (currentUser && currentUser.name) {
      setCurrentUser(currentUser.name);
    }
  }, []);

  const handleUserSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('username')?.toString().trim();
    if (name) {
      setCurrentUser(name); // Set the entered name as the current user
      setIsEditing(false); // Exit editing mode

      const newUser: User = {
        name: name,
      };

      // Save the current user to localStorage
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      console.log("apiInsertUser")
      const response = await apiInsertUser(newUser);
      console.log("response", response)
      // Retrieve users from localStorage or initialize an empty array
      const storedUsers = localStorage.getItem("users");
      const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

      // Check if user already exists
      const existingUserIndex = users.findIndex(user => user.name === name);

      if (existingUserIndex === -1) {
        // If user doesn't exist, add the new user
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users)); // Update users in localStorage
      }
    }
  };

  const handleAddUser = () => {
    setIsEditing(true); // Switch to form for adding/changing user
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-transform duration-300 ${
        isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
      }`}
    >
      <div className="bg-light-background dark:bg-dark-background rounded-lg shadow-lg p-5 w-full max-w-md max-h-[95vh] overflow-y-auto task-menu">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-light-foreground dark:text-dark-foreground">
            <FaUser className="text-3xl mr-3" />
            <h2 className="text-xl font-bold mt-2 font-stix">User</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-light-background hover:bg-light-accent dark:hover:bg-dark-secondary transition-colors duration-300 text-gray-700"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Display current user or show form for adding/changing user */}
        {isEditing ? (
          <form onSubmit={handleUserSubmit} className="space-y-4">
            <input
              id="username"
              name="username"
              type="text"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-dark-foreground font-stix"
              placeholder="Enter your name"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-light-primary dark:bg-dark-primary text-white rounded hover:bg-light-secondary dark:hover:bg-dark-secondary transition-colors"
            >
              Save
            </button>
          </form>
        ) : currentUser ? (
          <div>
            <div className='flex justify-center'>
              <p className="text-lg text-light-foreground dark:text-dark-foreground font-stix">
                Current User: <strong>{currentUser}</strong>
              </p>
            </div>
            <button
              onClick={handleAddUser}
              className="px-4 py-2 mt-4 bg-light-secondary dark:bg-dark-secondary text-white rounded hover:bg-light-accent dark:hover:bg-dark-accent transition-colors"
            >
              Change User
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-light-foreground dark:text-dark-foreground text-lg">No user selected</p>
            <button
              onClick={handleAddUser}
              className="flex items-center px-4 py-2 mt-4 bg-light-primary dark:bg-dark-primary text-white rounded hover:bg-light-secondary dark:hover:bg-dark-secondary transition-colors"
            >
              <FaUserPlus className="mr-2" /> Add User
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserModal;
