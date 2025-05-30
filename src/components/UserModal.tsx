import React, { useEffect, useState } from "react";
import { FaBars, FaSpinner, FaStar, FaTimes } from "react-icons/fa";
import { User } from "../lib/types";
import {
  apiAuthenticateUser,
  apiGetUsers,
  apiInsertUser,
} from "../lib/apiHelper";
import Image from "next/image";
import Alert from "./Alert";
import { useUser } from "../app/context/UserContext";
import { capitalizeFirstLetter } from "../lib/formater";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: "practice" | "compete";
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser, setUserLoggedIn } = useUser();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>(""); // State for confirm password
  const [isChangingUser, setIsChangingUser] = useState(false);
  const [isSignup, setIsSignup] = useState(false); // State for toggling between login and signup
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [status, setStatus] = useState<{
    success: string;
    message: string;
    bg?: string;
  }>();
  const [users, setUsers] = useState<User[]>([]);
  const [usernameTaken, setUsernameTaken] = useState<{
    status: boolean;
    message: string;
  }>({ status: false, message: "" });
  const [passwordsDontMatch, setPasswordsDontMatch] = useState<{
    status: boolean;
    message: string;
  }>({ status: false, message: "" });
  const [loginFailed, setLoginFailed] = useState<{
    status: boolean;
    message: string;
  }>({ status: false, message: "" });
  const [isSignupDisabled, setIsSignupDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState<
    "login" | "signup" | "changeUser" | "logout" | "null"
  >("null");
  const [isInsertUserCalled, setIsInsertUserCalled] = useState(false);
  // Placeholder users array
  const previousUsers: User[] = [
    // Add your previous users here if any
  ];

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      const storedUser = localStorage.getItem("currentUser");
      const currentUser: User = storedUser ? JSON.parse(storedUser) : null;
      setCurrentUser(currentUser);
    }

    setLoginFailed({ status: false, message: "" });
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginFailed({ status: false, message: "" });
    setIsLoading("login");
    const user: User = {
      username: username,
      password: password,
    };

    const response = await apiAuthenticateUser(user);
    if (response.userData) {
      user.id = response.userData.id;
      localStorage.setItem("currentUser", JSON.stringify(response.userData));
      setUserLoggedIn(true);
      setCurrentUser(response.userData);
      setUsername("");
      setPassword("");
      onClose();
    } else {
      setLoginFailed({
        status: true,
        message: "Login Failed, please check your credentials!",
      });
      setIsLoading("null");
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading("signup");

    if (passwordsDontMatch?.status || usernameTaken?.status) {
      setIsLoading("null");
      return;
    }

    const newUser: User = {
      username: username,
      password: password,
    };

    if (!isInsertUserCalled) {
      const response = await apiInsertUser(newUser);
      if (response.userData) {
        newUser.id = response.userData.id;
        localStorage.setItem("currentUser", JSON.stringify(response.userData));
        setUserLoggedIn(true);
        setCurrentUser(response.userData);
        setIsAlertOpen(true);
        setStatus({
          success: "Success!",
          message: `Welcome ${newUser.username}!`,
          bg: "bg-blue-500",
        });
        setIsLoading("null");
        setTimeout(() => {
          setIsAlertOpen(false);
        }, 3000);
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setIsLoading("null");
        onClose();
      } else {
        setIsAlertOpen(true);
        setStatus({ success: "Error!", message: "A problem occured!" });
        setIsLoading("null");
        setTimeout(() => {
          setIsAlertOpen(false);
        }, 3000);
      }

      //give it some time
      setIsInsertUserCalled(true);
      setTimeout(() => {
        setIsInsertUserCalled(false);
      }, 3000);
    }
  };

  const handleLogout = () => {
    setIsLoading("logout");
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    onClose();
  };

  const handleChangeUser = () => {
    setIsLoading("changeUser");
    if (previousUsers.length === 0) {
      setIsChangingUser(false);
      setIsSignup(true);
      setIsLoading("null");
    } else {
      setIsChangingUser(true);
      setIsLoading("null");
    }
  };

  const handleBackToLogin = () => {
    setIsChangingUser(false);
  };

  // Toggle between login and signup forms
  const toggleSignup = () => {
    setIsSignup(!isSignup);
    setUsername(""); // Clear the username field
    setPassword(""); // Clear the password field
    setConfirmPassword(""); // Clear the confirm password field
  };

  useEffect(() => {
    const getUsers = async () => {
      if (isSignup) {
        const response = await apiGetUsers();
        setUsers(response);
      }
    };

    getUsers();
  }, [isSignup]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setUsername(inputValue);

    // Check if any user name matches the input value
    const isTaken = users.some((user: User) => {
      return user.username === inputValue;
    });

    if (isTaken) {
      setUsernameTaken({ status: true, message: "Username is already taken!" });
      setIsSignupDisabled(true);
    } else {
      setUsernameTaken({ status: false, message: "Available" });
      setIsSignupDisabled(false);
    }
  };

  const handleConfirmPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setConfirmPassword(inputValue);
    if (password !== inputValue) {
      setPasswordsDontMatch({
        status: true,
        message: "Passwords do not match, please check again!",
      });
    } else setPasswordsDontMatch({ status: false, message: "" });
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-transform duration-300 ${
        isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
      }`}
    >
      <div className="bg-light-background dark:bg-dark-background rounded-lg shadow-lg p-5 w-full sm:w-[90%] max-w-md max-h-[95vh] overflow-y-auto hide-scrollbar">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-light-foreground dark:text-dark-foreground">
            <Image
              src="/icons/profile.png"
              height={30}
              width={30}
              className="text-3xl mr-3"
              alt="Profile"
            />
            <h2 className="text-xl font-bold mt-1 font-dancing">User</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-light-background hover:bg-light-accent dark:hover:bg-dark-secondary transition-colors duration-300 text-gray-700"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Conditional rendering for user change screen */}
        {isChangingUser ? (
          <div className="text-center">
            <Image
              src="/storysets/add-user.svg"
              alt="Add user illustration"
              className="w-full h-48 object-contain"
              height={48}
              width={38}
            />
            <h3 className="text-xl font-bold mb-4 text-dark-background dark:text-light-background ">
              Select a User
            </h3>
            <div className="space-y-2">
              {previousUsers.map((user, index) => (
                <button
                  key={index}
                  className="w-full px-4 py-3 bg-light-secondary text-dark-background rounded-md font-semibold hover:text-light-background hover:bg-light-accent dark:hover:bg-dark-accent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-light-secondary dark:ring-dark-secondary focus:ring-offset-2"
                >
                  {user.username}
                </button>
              ))}
            </div>
            <div className="flex flex-row justify-between mt-5">
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
        ) : (
          <div>
            {isSignup ? ( // Render signup form if isSignup is true
              <>
                <div className="mt-0">
                  <Image
                    src="/storysets/user.svg"
                    alt="Signup illustration"
                    className="w-full h-48 object-contain"
                    height={48}
                    width={38}
                  />
                </div>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <input
                      id="username"
                      value={username}
                      onChange={(e) => handleUsernameChange(e)}
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-dark-background font-stix focus:ring-2 focus:ring-light-secondary focus:outline-none focus:border-transparent"
                      placeholder="Enter your username"
                      required
                    />
                    {usernameTaken?.status && (
                      <div className="text-light-accent dark:text-dark-secondary px-2 mt-3 font-dancing">
                        {usernameTaken?.message}
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      className="w-full p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-dark-background font-stix focus:ring-2 focus:ring-light-secondary focus:outline-none focus:border-transparent"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <div>
                    <input
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => handleConfirmPassword(e)}
                      type="password"
                      className="w-full p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-dark-background font-stix focus:ring-2 focus:ring-light-secondary focus:outline-none focus:border-transparent"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                  {passwordsDontMatch?.status && (
                    <div className="text-light-accent dark:text-dark-secondary px-2 mt-1 font-dancing">
                      {passwordsDontMatch.message}
                    </div>
                  )}
                  <button
                    type="submit"
                    className={`${
                      isSignupDisabled ? "disabled" : ""
                    } flex justify-center w-full px-4 py-3 mt-5 bg-light-secondary text-white rounded-md font-semibold hover:text-dark-background hover:bg-light-accent dark:hover:bg-dark-accent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-light-secondary dark:ring-dark-secondary focus:ring-offset-2`}
                  >
                    {isLoading === "signup" ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      "Sign Up"
                    )}
                  </button>
                </form>
                <div className="mt-4 text-center text-lg">
                  <p className="text-gray-600 dark:text-gray-300">
                    Already have an account?{" "}
                    <span
                      className="text-light-secondary cursor-pointer hover:underline"
                      onClick={toggleSignup}
                    >
                      Login
                    </span>
                  </p>
                </div>
              </>
            ) : (
              <>
                {!currentUser && (
                  <>
                    <div className="mt-0">
                      <Image
                        src="/storysets/user.svg"
                        alt="Login illustration"
                        className="w-full h-48 object-contain"
                        height={48}
                        width={38}
                      />
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <input
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          type="text"
                          className="w-full p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-dark-background font-stix focus:ring-2 focus:ring-light-secondary focus:outline-none focus:border-transparent"
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
                          className="w-full p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-dark-background font-stix focus:ring-2 focus:ring-light-secondary focus:outline-none focus:border-transparent"
                          placeholder="Enter your password"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full px-4 py-3 mt-5 flex justify-center bg-light-secondary text-white rounded-md font-semibold hover:text-dark-background hover:bg-light-accent dark:hover:bg-dark-accent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-light-secondary dark:ring-dark-secondary focus:ring-offset-2"
                      >
                        {isLoading === "login" ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          "Login"
                        )}
                      </button>

                      {loginFailed?.status && (
                        <div className="text-light-accent dark:text-dark-secondary px-2 mt-3 mb-3 font-dancing">
                          {loginFailed?.message}
                        </div>
                      )}
                    </form>
                    <div className="mt-4 text-center  text-lg">
                      <p className="text-gray-600 dark:text-gray-300">
                        Do not have an account?{" "}
                        <span
                          className="text-light-secondary cursor-pointer  hover:underline"
                          onClick={toggleSignup}
                        >
                          Sign Up
                        </span>
                      </p>
                    </div>
                  </>
                )}
                {currentUser && (
                  <div className="mt-6 flex-col text-center">
                    <div className="mb-2">
                      <Image
                        src="/storysets/logged-in.svg"
                        alt="Logged-in"
                        className="w-full h-48 object-contain"
                        height={48}
                        width={38}
                      />
                    </div>
                    <p className="text-xl text-gray-600 dark:text-gray-300 font-stix mt-1">
                      Logged in as: <strong>{currentUser.username}</strong>
                    </p>
                    <div className="mt-2 flex flex-col justify-between text-xl text-dark-background dark:text-light-background">
                      {currentUser.skillLevel && (
                        <div className="flex flex-row justify-center">
                          <FaBars className="mr-2 mt-1 text-light-primary dark:text-dark-primary" />
                          <span className="flex flex-row">
                            Skill Level:
                            <span className="ml-1">
                              {capitalizeFirstLetter(currentUser.skillLevel)}
                            </span>
                          </span>
                        </div>
                      )}
                      <div className="flex flex-row justify-center">
                        <FaStar className="mr-2 mt-1 text-light-primary dark:text-dark-primary" />
                        <span>
                          Stars:
                          <span className="ml-1">{currentUser.stars}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-row justify-between mt-5">
                      <button
                        type="button"
                        className="flex justify-center flex-1 px-4 py-3 bg-light-secondary  rounded-md font-semibold text-light-background hover:bg-light-accent dark:hover:bg-dark-accent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-light-secondary dark:ring-dark-secondary focus:ring-offset-2 mr-2"
                        onClick={handleChangeUser}
                      >
                        {isLoading === "changeUser" ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          "Change User"
                        )}
                      </button>
                      <button
                        type="button"
                        className="flex justify-center flex-1 px-4 py-3 bg-light-secondary rounded-md font-semibold text-light-background hover:bg-light-accent dark:hover:bg-dark-accent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-light-secondary dark:ring-dark-secondary focus:ring-offset-2 ml-2"
                        onClick={handleLogout}
                      >
                        {isLoading === "logout" ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          "Log Out"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      {isAlertOpen && (
        <Alert
          title={status?.success}
          message={status?.message}
          bg={status?.bg}
          onClose={() => setIsAlertOpen(false)}
        />
      )}
    </div>
  );
};

export default UserModal;
