import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import ProtectedLayout from "@/layouts/ProtectedLayout";

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

export const ProtectedRoute = ({
  children,
  fallback = "/login",
  useLayout = true,
  title,
}) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated()) {
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  if (!user) {
    return <LoadingSpinner />;
  }

  if (useLayout) {
    return <ProtectedLayout title={title}>{children}</ProtectedLayout>;
  }

  return children;
};

export default ProtectedRoute;
