import React from "react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AnimatedSection } from "../AnimatedSection";
import { ParallaxSection } from "../ParallaxSection";
import { TetrisBlock } from "../TetrisBlock";

export const ClassicGame = () => {
  return (
    <AnimatedSection className="py-20" id="gameplay" variant="slideLeft">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="mb-4 bg-tetris-green text-background">
              Classic Gameplay
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Master the Art of
              <span className="text-tetris-green"> Falling Blocks</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 text-pretty">
              {
                "Experience the timeless puzzle mechanics that made Tetris legendary. Rotate, position, and clear lines with precision timing and strategic thinking."
              }
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <TetrisBlock color="#00ff00" size={16} />
                <span>Seven unique Tetrimino shapes</span>
              </div>
              <div className="flex items-center gap-3">
                <TetrisBlock color="#00f5ff" size={16} />
                <span>Smooth rotation and movement</span>
              </div>
              <div className="flex items-center gap-3">
                <TetrisBlock color="#ffff00" size={16} />
                <span>Perfect line clearing mechanics</span>
              </div>
              <div className="flex items-center gap-3">
                <TetrisBlock color="#ff8800" size={16} />
                <span>Classic scoring system</span>
              </div>
            </div>
          </div>

          <ParallaxSection offset={30}>
            <Card className="p-8 bg-card/50 backdrop-blur-sm border-tetris-green/20">
              <div className="grid grid-cols-10 gap-1 mb-6">
                {Array.from({ length: 200 }).map((_, i) => {
                  const filled = Math.random() > 0.7;
                  const colors = [
                    "#00f5ff",
                    "#ffff00",
                    "#ff8800",
                    "#aa00ff",
                    "#00ff00",
                    "#0088ff",
                    "#ff0000",
                  ];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: filled ? 1 : 0.1, scale: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.01 }}
                    >
                      <TetrisBlock
                        color={
                          filled
                            ? colors[Math.floor(Math.random() * colors.length)]
                            : "#333"
                        }
                        size={20}
                      />
                    </motion.div>
                  );
                })}
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Live Game Preview
                </p>
              </div>
            </Card>
          </ParallaxSection>
        </div>
      </div>
    </AnimatedSection>
  );
};
