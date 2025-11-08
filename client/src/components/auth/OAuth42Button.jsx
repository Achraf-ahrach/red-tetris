import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const OAuth42Button = ({ text = "Sign in with 42" }) => {
  const handleOAuthLogin = () => {
    const apiUrl = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";
    window.location.href = `${apiUrl}/auth/42`;
  };

  return (
    <>
      <div className="relative my-6">
        <Separator className="bg-border/50" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-sm text-muted-foreground">
          or
        </span>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full h-11 border-border/50 hover:bg-accent transition-all text-base font-medium"
        onClick={handleOAuthLogin}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L8.5 3.5V8.5L12 12L15.5 8.5V3.5L12 0Z M15.5 15.5L12 12L8.5 15.5V20.5L12 24L15.5 20.5V15.5Z M0 12L3.5 8.5H8.5L12 12L8.5 15.5H3.5L0 12Z M24 12L20.5 8.5H15.5L12 12L15.5 15.5H20.5L24 12Z" />
        </svg>
        {text}
      </Button>
    </>
  );
};
