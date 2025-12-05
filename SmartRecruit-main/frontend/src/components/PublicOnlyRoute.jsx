import { Navigate } from "react-router-dom";

const isAuthenticated = () => {
  return Boolean(localStorage.getItem("email"));
};

const PublicOnlyRoute = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/recruiter" replace />;
  }
  return children;
};

export default PublicOnlyRoute;




