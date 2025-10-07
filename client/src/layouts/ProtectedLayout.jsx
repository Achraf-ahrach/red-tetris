import React from "react";
import Navbar from "@/components/Navbar";

export const ProtectedLayout = ({ children, title }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title={title} />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default ProtectedLayout;
