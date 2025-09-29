import LandingPage from "@/pages/landing";
import { createBrowserRouter } from "react-router-dom";
import Game from "@/pages/game";
import MultiplayerSetup from "@/pages/multiplayer";
import MultiplayerGame from "@/pages/multiplayer-game";
import HashHandler from "@/components/HashHandler";
import { Navigate } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HashHandler />,
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
    element: <Navigate to="/" replace />,
  },
]);

export default router;
