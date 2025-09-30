import { GameModes } from "@/components/landing/GameModes";
import { HeroSection } from "@/components/landing/HeroSection";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const startGame = () => {
    navigate("/game");
  };

  return (
      <div className="min-h-screen bg-background grid-bg relative">
        <HeroSection/>
        <GameModes/>
      </div>
  );
};

export default LandingPage;
