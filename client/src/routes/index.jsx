import LandingPage from "@/pages/landing";
import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/game",
    element: <Game />,
  },
  {
    path: "/multiplayer",
    element: <MultiplayerSetup />,
  },
  {
    path: "/multiplayer-game",
    element: <MultiplayerGame />,
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
]);

export default router;
