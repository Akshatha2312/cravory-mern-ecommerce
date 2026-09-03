<<<<<<< HEAD
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not admin
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Admin user
=======
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  // not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // logged in but not admin
  if (user.role !== "admin") {
    return <Navigate to="/" />;
  }

  // admin user
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
  return children;
};

export default AdminRoute;
