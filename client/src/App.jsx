import Game from "./pages/game";
import LandingPage from "./pages/landing";
import MultiplayerSetup from "./pages/multiplayer";
import MultiplayerGame from "./pages/multiplayer-game";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

function App() {
  return (
    // <SocketProvider>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/game" element={<Game />} />
        <Route path="/multiplayer" element={<MultiplayerSetup />} />
        <Route path="/multiplayer-game" element={<MultiplayerGame />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
    // </SocketProvider>
  );
}

export default App;
