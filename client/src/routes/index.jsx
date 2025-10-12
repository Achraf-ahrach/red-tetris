import { AuthLayout } from "@/layouts/AuthLayout";
import { Login } from "@/pages/auth/login";
import { Register } from "@/pages/auth/register";
import GamePage from "@/pages/game";
import { createBrowserRouter, Link } from "react-router-dom";
import LandingPage from "@/pages/landing";
import Profile from "@/pages/profile";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/layouts/AppLayout";
import Leaderboard from "@/pages/leaderboard";
import GuestRoute from "@/components/GuestRoute";
import Success from "@/pages/auth/success";
import ErrorPage from "@/pages/auth/error";
import NotFoundPage from "@/pages/NotFound";
import MultiplayerSetup from "@/pages/multiplayer";
import HashHandler from "./HashHandler";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HashHandler />,
  },
  {
    path: "/multiplayer",
    element: <MultiplayerSetup />,
  },
  {
    path: "auth/success",
    element: <Success />,
  },
  {
    path: "auth/error",
    element: <ErrorPage />,
  },
  {
    path: "login",
    element: (
      <GuestRoute>
        <AuthLayout
          title="Welcome back"
          description="Log in to your account"
          footerContent={
            <p className="text-sm text-center">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary">
                Register
              </Link>
            </p>
          }
        />
      </GuestRoute>
    ),
    children: [{ index: true, element: <Login /> }],
  },
  {
    path: "register",
    element: (
      <GuestRoute>
        <AuthLayout
          title="Create account"
          description="Join the Tetris community and start playing"
          footerContent={
            <p className="text-sm text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-primary">
                Login
              </Link>
            </p>
          }
        />
      </GuestRoute>
    ),
    children: [{ index: true, element: <Register /> }],
  },
  {
    element: (
      <ProtectedRoute useLayout={false}>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/game",
        element: <GamePage />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/leaderboard",
        element: <Leaderboard />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
