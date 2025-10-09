import React from "react";

export const ProtectedLayout = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-background">
      <main className="relative pl-20 md:pl-24 xl:pl-28">{children}</main>
    </div>
  );
};

export default ProtectedLayout;
