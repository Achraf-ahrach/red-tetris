import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { tokenUtils } from "@/api/auth/keys";

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Completing sign-in...");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get("token");
    const refreshToken = params.get("refresh");
    const redirect = params.get("redirect") || "/profile";

    if (accessToken && refreshToken) {
      tokenUtils.setTokens(accessToken, refreshToken);
      setMessage("Success! Redirecting...");
      const to = redirect.startsWith("/") ? redirect : "/profile";
      const t = setTimeout(() => navigate(to, { replace: true }), 500);
      return () => clearTimeout(t);
    } else {
      setMessage("Missing tokens. Redirecting to login...");
      const t = setTimeout(() => navigate("/login", { replace: true }), 800);
      return () => clearTimeout(t);
    }
  }, [location.search, navigate]);

  return (
    <div className="pl-16 relative z-10">
      <div className="container mx-auto px-6 py-10 max-w-xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;
