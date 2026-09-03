<<<<<<< HEAD
/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react";
=======
import { createContext, useEffect, useState } from "react";
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
<<<<<<< HEAD
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      try {
        return JSON.parse(storedUser);
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        return null;
      }
    }
    return null;
  });
=======
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

<<<<<<< HEAD
  const updateUser = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

=======
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
<<<<<<< HEAD
    <AuthContext.Provider value={{ user, login, updateUser, logout }}>
=======
    <AuthContext.Provider value={{ user, login, logout }}>
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
      {children}
    </AuthContext.Provider>
  );
};
