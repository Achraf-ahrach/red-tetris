import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import BottomDock from "@/components/BottomDock";
import Navbar from "@/components/Navbar";

const AppLayout = () => {
  const location = useLocation();

  // Add smooth scrolling and focus management for better UX
  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Focus management for accessibility
    const mainElement = document.querySelector("main");
    if (mainElement) {
      mainElement.focus();
    }
  }, [location.pathname]);

  const showSidebar = location.pathname !== "/"; 

  return (
    <div className="min-h-screen flex bg-background text-foreground text-render-optimized selection-primary smooth-scroll">
      {showSidebar && <Navbar />}
      <main
        className={`${
          showSidebar ? "pt-16 md:pt-0 md:ml-20" : ""
        } flex-1 relative focus:outline-none w-full`}
        tabIndex={-1}
        role="main"
        aria-label="Main content"
      >
        <div className="pb-20 md:pb-8 w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
