import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const GuestRoute = ({ children, redirectTo = "/profile" }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; 

  if (isAuthenticated()) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
};

export default GuestRoute;
