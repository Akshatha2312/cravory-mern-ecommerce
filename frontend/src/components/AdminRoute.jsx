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
  return children;
};

export default AdminRoute;
