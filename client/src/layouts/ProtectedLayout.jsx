import React from "react";
import Navbar from "@/components/Navbar";

export const ProtectedLayout = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="relative">
        {children}
      </main>
    </div>
  );
};

export default ProtectedLayout;
