/* eslint-disable react/prop-types */
import { useContext, createContext, useState, useEffect } from "react";

const UserContext = createContext({});

function UserContextProvider({ children }) {
  const [userInfo, setUserInfo] = useState(() => {
    //retrive user info habang initialization
    const saveUser = localStorage.getItem("userInfo");
    return saveUser ? JSON.parse(saveUser) : null;
  });

  const [loginID, setLoginID] = useState(() => {
    //retrive user info habang initialization
    const saveUser = localStorage.getItem("loginID");
    return saveUser ? JSON.parse(saveUser) : null;
  });

  const [usertoken, setToken] = useState(
    localStorage.getItem("accessToken") || undefined
  ); // Initialize from localStorage

  // Add isLoading state
  const [isLoading, setIsLoading] = useState(false);

  // Add isAuthenticated function
  const isAuthenticated = () => {
    return (
      userInfo !== null &&
      usertoken !== undefined &&
      usertoken !== null &&
      userInfo.archive !== "Yes"
    );
  };

  useEffect(() => {
    if (userInfo) {
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
    }
  }, [userInfo]);

  useEffect(() => {
    if (usertoken) {
      localStorage.setItem("accessToken", usertoken);
    }
  }, [usertoken]);
  const canManageEvents = () => {
    return (
      userInfo?.userRole === "GSO Director" ||
      userInfo?.userRole === "GSO Officer"
    );
  };

  useEffect(() => {
    if (loginID) {
      localStorage.setItem("loginID", JSON.stringify(loginID));
    }
  }, [loginID]);

  const login = (newUserInfo, newloginID) => {
    setUserInfo(newUserInfo);
    setLoginID(newloginID);
    localStorage.setItem("userInfo", JSON.stringify(newUserInfo));
    localStorage.setItem("loginID", JSON.stringify(newloginID)); // Fixed: was using loginID instead of newloginID
    // console.log(newUserInfo);
  };

  const logout = () => {
    setUserInfo(null);
    setLoginID(null); // Added: clear loginID on logout
    setToken(undefined); // Added: clear token on logout
    localStorage.removeItem("userInfo");
    localStorage.removeItem("loginID"); // Added: remove loginID from localStorage
    localStorage.removeItem("accessToken");
  };

  return (
    <UserContext.Provider
      value={{
        logout,
        login,
        userInfo,
        setUserInfo,
        usertoken,
        setToken,
        loginID,
        canManageEvents,
        setLoginID,
        isAuthenticated, // Add this
        isLoading, // Add this
        setIsLoading, // Add this if you need it elsewhere
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export default UserContextProvider;

export const useUserContext = () => {
  return useContext(UserContext);
};
