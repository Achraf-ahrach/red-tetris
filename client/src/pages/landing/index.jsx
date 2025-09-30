import { ClassicGame } from "@/components/landing/ClassicGame";
import { GameModes } from "@/components/landing/GameModes";
import { HeroSection } from "@/components/landing/HeroSection";
import { MultiplayerMode } from "@/components/landing/MultiplayerMode";
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
        <ClassicGame/>
        <MultiplayerMode/>
      </div>
  );
};

export default LandingPage;
