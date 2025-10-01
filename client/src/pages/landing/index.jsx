import { ClassicGame } from "@/components/landing/ClassicGame";
import { CTA } from "@/components/landing/Cta";
import { GameModes } from "@/components/landing/GameModes";
import { HeroSection } from "@/components/landing/HeroSection";
import { Leaderboard } from "@/components/landing/Leaderboard";
import { MultiplayerMode } from "@/components/landing/MultiplayerMode";
import { TetrisBlock } from "@/components/TetrisBlock";
import {motion} from 'motion/react'

const LandingPage = () => {
const pieces = [
    { color: "#00f5ff", delay: 0, x: "10%", duration: 15 }, // Cyan I-piece
    { color: "#ffff00", delay: 2, x: "80%", duration: 18 }, // Yellow O-piece
    { color: "#ff8800", delay: 4, x: "60%", duration: 20 }, // Orange L-piece
    { color: "#aa00ff", delay: 6, x: "30%", duration: 16 }, // Purple T-piece
    { color: "#00ff00", delay: 1, x: "90%", duration: 19 }, // Green S-piece
    { color: "#0088ff", delay: 3, x: "20%", duration: 22 }, // Blue J-piece
    { color: "#ff0000", delay: 5, x: "70%", duration: 17 }, // Red Z-piece
    { color: "#ff69b4", delay: 7, x: "45%", duration: 21 }, // Pink piece
    { color: "#32cd32", delay: 8, x: "15%", duration: 14 }, // Lime piece
    { color: "#ffa500", delay: 9, x: "75%", duration: 16 }, // Orange piece
  ]
  return (
      <div className="relative">
        {/* Fixed background with falling pieces */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {pieces.map((piece, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: piece.x, top: "-100px" }}
            animate={{
              y: ["0vh", "110vh"],
              rotate: [0, 360],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: piece.duration,
              delay: piece.delay,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            <div className="flex">
              <TetrisBlock color={piece.color} size={16} />
              <TetrisBlock color={piece.color} size={16} />
              <TetrisBlock color={piece.color} size={16} />
              <TetrisBlock color={piece.color} size={16} />
            </div>
          </motion.div>
        ))}
        </div>

        {/* Main content with higher z-index */}
        <div className="relative z-10">
          <HeroSection/>
          <ClassicGame/>
          <MultiplayerMode/>
          <Leaderboard/>
          <CTA/>
        </div>
      </div>
  );
};

export default LandingPage;
