import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

const TetrisBlock = ({ color, size = 20, className = "" }) => (
  <div
    className={`pixel-perfect ${className}`}
    style={{
      width: size,
      height: size,
      backgroundColor: color,
      border: `2px solid ${color}`,
      filter: "brightness(1.2)",
      boxShadow: `inset 2px 2px 0 rgba(255,255,255,0.3), inset -2px -2px 0 rgba(0,0,0,0.3)`,
    }}
  />
);

const ParallaxSection = ({ children, offset = 50 }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, offset]);

  return (
    <motion.div ref={ref} style={{ y }}>
      {children}
    </motion.div>
  );
};

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen flex items-center justify-center relative">
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-6 glow-text text-balance"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            The Ultimate
            <br />
            <span className="text-primary">TETRIS</span>
            <br />
            Experience
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            {
              "Master the art of falling blocks with modern features, multiplayer battles, and endless challenges."
            }
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 text-lg"
              onClick={() => navigate("/game")}
            >
              <Play className="w-5 h-5 mr-2" />
              Start Playing
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Hero Tetris Grid */}
      <ParallaxSection offset={100}>
        <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden lg:block opacity-20">
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: Math.random() > 0.7 ? 1 : 0.3, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <TetrisBlock
                  color={
                    [
                      "#00f5ff",
                      "#ffff00",
                      "#ff8800",
                      "#aa00ff",
                      "#00ff00",
                      "#0088ff",
                      "#ff0000",
                    ][Math.floor(Math.random() * 7)]
                  }
                  size={24}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </ParallaxSection>
    </section>
  );
};
