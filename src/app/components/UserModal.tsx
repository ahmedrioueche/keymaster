import React, { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { User } from "../types/types";
import { apiInsertUser } from '../utils/apiHelper';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose }) => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isChangingUser, setIsChangingUser] = useState(false);

  // Placeholder users array
  const previousUsers: User[] = [
  
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    const currentUser: User = storedUser ? JSON.parse(storedUser) : null;
    if (currentUser && currentUser.name) {
      setCurrentUser(currentUser.name);
    }
  }, []);

  const handleUserSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let newUser: User = {
      name: username,
      password: password,
    };


    const response = await apiInsertUser(newUser);
    console.log("response", response);
    if(response){
      newUser.id = response.id;
    }
    
    localStorage.setItem("currentUser", JSON.stringify(newUser));

    setCurrentUser(username);
    setUsername('');
    setPassword('');
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    onClose();
  };

  const handleChangeUser = () => {
    if (previousUsers.length === 0) {
      // If users array is empty, go directly to the login form
      localStorage.removeItem("currentUser");
      setCurrentUser(null);
      setIsChangingUser(false);
    } else {
      // Otherwise, show user selection screen
      handleLogout();
      setIsChangingUser(true);
    }
  };

  const handleBackToLogin = () => {
    setIsChangingUser(false);
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-transform duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
    >
      <div className="bg-light-background dark:bg-dark-background rounded-lg shadow-lg p-5 w-full sm:w-[90%] max-w-md max-h-[95vh] overflow-y-auto hide-scrollbar">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-light-foreground dark:text-dark-foreground">
            <img src='/icons/profile.png' height={30} width={30} className="text-3xl mr-3" alt="Profile" />
            <h2 className="text-xl font-bold mt-1 font-stix">User</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-light-background hover:bg-light-accent dark:hover:bg-dark-secondary transition-colors duration-300 text-gray-700"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Conditional rendering for user change screen */}
        {isChangingUser ? (
          <>
            <div className="text-center">
              <img src="/storysets/add-user.svg" alt="Add user illustration" className="w-full h-48 object-contain" />
              <h3 className="text-xl font-bold mb-4 text-dark-background dark:text-light-background ">Select a User</h3>
              <div className="space-y-2">
                {previousUsers.map((user, index) => (
                  <button
                    key={index}
                    className="w-full px-4 py-3 bg-light-secondary text-dark-background rounded-md font-semibold hover:text-light-background hover:bg-light-accent dark:hover:bg-dark-accent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-light-secondary dark:ring-dark-secondary focus:ring-offset-2"
                  >
                    {user.name}
                  </button>
                ))}
              </div>
              <div className='flex flex-row justify-between mt-5'>
                <button
                  type="button"
                  className="flex-1 px-4 py-3 bg-light-secondary text-dark-background rounded-md font-semibold hover:text-light-background hover:bg-light-accent dark:hover:bg-dark-accent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-light-secondary dark:ring-dark-secondary focus:ring-offset-2 mr-2"
                  onClick={handleBackToLogin}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="flex-1 px-4 py-3 bg-light-secondary text-dark-background rounded-md font-semibold hover:text-light-background hover:bg-light-accent dark:hover:bg-dark-accent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-light-secondary dark:ring-dark-secondary focus:ring-offset-2 ml-2"
                  onClick={handleLogout}
                >
                  New User
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {!currentUser && (
              <>
                <div className="">
                  <img src="/storysets/login.svg" alt="Login illustration" className="w-full h-48 object-contain" />
                </div>

                <form onSubmit={handleUserSubmit} className="space-y-4">
                  <div>
                    <input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-stix focus:ring-2 focus:ring-light-secondary focus:outline-none focus:border-transparent"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                  <div>
                    <input
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      className="w-full p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-stix focus:ring-2 focus:ring-light-secondary focus:outline-none focus:border-transparent"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 py-3 mt-5 bg-light-secondary text-white rounded-md font-semibold hover:text-dark-background hover:bg-light-accent dark:hover:bg-dark-accent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-light-secondary dark:ring-dark-secondary focus:ring-offset-2"
                  >
                    Log In
                  </button>
                </form>
              </>
            )}

            {currentUser && (
              <div className="mt-6 text-center">
                <div className="mb-2">
                  <img src="/storysets/logged-in.svg" alt="Logged-in" className="w-full h-48 object-contain" />
                </div>            
                <p className="text-xl text-gray-600 dark:text-gray-300 font-stix mt-1">
                  Logged in as: <strong>{currentUser}</strong>
                </p>
                <div className='flex flex-row justify-between mt-5'>
                  <button
                    type="button"
                    className="flex-1 px-4 py-3 bg-light-secondary text-dark-background rounded-md font-semibold hover:text-light-background hover:bg-light-accent dark:hover:bg-dark-accent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-light-secondary dark:ring-dark-secondary focus:ring-offset-2 mr-2"
                    onClick={handleChangeUser}
                  >
                    Change User
                  </button>
                  <button
                    type="button"
                    className="flex-1 px-4 py-3 bg-light-secondary text-dark-background rounded-md font-semibold hover:text-light-background hover:bg-light-accent dark:hover:bg-dark-accent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-light-secondary dark:ring-dark-secondary focus:ring-offset-2 ml-2"
                    onClick={handleLogout}
                  >
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserModal;
