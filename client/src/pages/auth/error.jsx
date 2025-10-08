import React from "react";
import { useLocation, Link } from "react-router-dom";

const ErrorPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const message = params.get("message") || "Authentication failed.";

  return (
    <div className="pl-16 relative z-10">
      <div className="container mx-auto px-6 py-10 max-w-xl">
        <div className="rounded-md border bg-card p-6">
          <h1 className="text-xl font-semibold mb-2">Sign-in error</h1>
          <p className="text-sm text-muted-foreground mb-4">{message}</p>
          <div className="flex gap-3">
            <Link
              to="/login"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Back to login
            </Link>
            <Link
              to="/"
              className="px-4 py-2 border rounded-md hover:bg-accent hover:text-accent-foreground"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
