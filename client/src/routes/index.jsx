import { AuthLayout } from "@/layouts/AuthLayout";
import { Login } from "@/pages/auth/login";
import { Register } from "@/pages/auth/register";
import LandingPage from "@/pages/landing";
import { createBrowserRouter, Link } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "login",
    element: (
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
    ),
    children: [{ index: true, element: <Login /> }],
  },
  {
    path: "register",
    element: (
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
    ),
    children: [{ index: true, element: <Register /> }],
  },
]);

export default router;
