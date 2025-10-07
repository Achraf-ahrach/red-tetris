import React from "react";
import { Outlet } from "react-router-dom";
import BottomDock from "@/components/BottomDock";

const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Outlet />
      </main>
      <BottomDock />
    </div>
  );
};

export default AppLayout;
