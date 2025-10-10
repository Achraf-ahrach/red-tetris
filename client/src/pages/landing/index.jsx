import { ClassicGame } from "@/components/landing/ClassicGame";
import { CTA } from "@/components/landing/Cta";
import { HeroSection } from "@/components/landing/HeroSection";
import { Leaderboard } from "@/components/landing/Leaderboard";
import { MultiplayerMode } from "@/components/landing/MultiplayerMode";
import { TetrisBlock } from "@/components/TetrisBlock";
import { PageTransition } from "@/components/ui/page-transition";
import { Navbar } from "@/components/Navbar";
import { motion } from "motion/react";

const LandingPage = () => {

  
  const pieceShapes = {
    I: [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ],
    O: [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
    T: [
      [1, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    S: [
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
    ],
    Z: [
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
    ],
    J: [
      [0, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    L: [
      [2, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
  };

  const renderTetrisPiece = (type, color, size = 16) => {
    const shape = pieceShapes[type];
    return (
      <div className="relative">
        {shape.map((block, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              left: block[0] * size,
              top: block[1] * size,
            }}
          >
            <TetrisBlock color={color} size={size} />
          </div>
        ))}
      </div>
    );
  };

  const pieces = [
    { type: "I", color: "#00f5ff", delay: 0, x: "10%", duration: 15 }, // Cyan I-piece
    { type: "O", color: "#ffff00", delay: 2, x: "80%", duration: 18 }, // Yellow O-piece
    { type: "L", color: "#ff8800", delay: 4, x: "60%", duration: 20 }, // Orange L-piece
    { type: "T", color: "#aa00ff", delay: 6, x: "30%", duration: 16 }, // Purple T-piece
    { type: "S", color: "#00ff00", delay: 1, x: "90%", duration: 19 }, // Green S-piece
    { type: "J", color: "#0088ff", delay: 3, x: "20%", duration: 22 }, // Blue J-piece
    { type: "Z", color: "#ff0000", delay: 5, x: "70%", duration: 17 }, // Red Z-piece
    { type: "T", color: "#ff69b4", delay: 7, x: "45%", duration: 21 }, // Pink T-piece
    { type: "L", color: "#32cd32", delay: 8, x: "15%", duration: 14 }, // Lime L-piece
    { type: "I", color: "#ffa500", delay: 9, x: "75%", duration: 16 }, // Orange I-piece
  ];
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
            {renderTetrisPiece(piece.type, piece.color, 16)}
          </motion.div>
        ))}
      </div>

      {/* Main content with higher z-index */}
      <PageTransition variant="fade" className="relative z-10">
        <HeroSection />
        <ClassicGame />
        <MultiplayerMode />
        <Leaderboard />
        <CTA />
      </PageTransition>
    </div>
  );
};

export default LandingPage;
