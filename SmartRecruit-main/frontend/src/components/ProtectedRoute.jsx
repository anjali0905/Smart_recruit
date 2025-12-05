import { Navigate } from "react-router-dom";

const isAuthenticated = () => {
  return Boolean(localStorage.getItem("email"));
};

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;




