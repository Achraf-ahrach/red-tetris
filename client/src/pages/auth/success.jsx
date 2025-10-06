import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle } from "lucide-react";

export const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const refresh = searchParams.get("refresh");
    const error = searchParams.get("message");

    if (error) {
      console.error("Auth error:", error);
      setTimeout(() => navigate("/auth/login", { state: { error } }), 2000);
      return;
    }

    if (token && refresh) {
      try {
        // Store tokens securely
        localStorage.setItem("accessToken", token);
        localStorage.setItem("refreshToken", refresh);

        // Clear URL parameters for security
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        console.log("42 authentication successful");

        // Redirect to game after short delay
        setTimeout(() => navigate("/game"), 1500);
      } catch (err) {
        console.error("Failed to store tokens:", err);
        navigate("/auth/login", {
          state: { error: "Failed to save authentication" },
        });
      }
    } else {
      // No tokens received, redirect to login
      console.error("No tokens received from 42 authentication");
      navigate("/auth/login", {
        state: { error: "Authentication incomplete" },
      });
    }
  }, [navigate, searchParams]);

  const token = searchParams.get("token");
  const error = searchParams.get("message");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full text-center">
        {error ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="space-y-4"
          >
            <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold text-foreground">
              Authentication Failed
            </h2>
            <p className="text-muted-foreground">{error}</p>
            <p className="text-sm text-muted-foreground">
              Redirecting to login...
            </p>
          </motion.div>
        ) : token ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="space-y-4"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-semibold text-foreground">
              Welcome to Red Tetris!
            </h2>
            <p className="text-muted-foreground">
              Successfully authenticated with 42 Network
            </p>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="flex justify-center"
            >
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </motion.div>
            <p className="text-sm text-muted-foreground">
              Redirecting to game...
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="flex justify-center"
            >
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </motion.div>
            <h2 className="text-xl font-semibold text-foreground">
              Processing Authentication...
            </h2>
            <p className="text-sm text-muted-foreground">
              Please wait while we complete your sign-in
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
