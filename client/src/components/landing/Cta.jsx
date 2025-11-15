import React from "react";
import { AnimatedSection } from "../AnimatedSection";
import { motion } from "motion/react";
import { Button } from "../ui/button";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CTA = () => {
  const navigate = useNavigate();

  return (
    <AnimatedSection className="py-20">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          whileInView={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 glow-text text-balance">
            Ready to Play?
          </h2>
        </motion.div>

        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {
            "Join millions of players worldwide in the ultimate Tetris experience. Start your journey to becoming a block-stacking legend."
          }
        </p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          whileInView={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-12 py-4 text-xl"
            onClick={() => navigate("/game")}
          >
            <Play className="w-6 h-6 mr-2" />
            Start Playing Now
          </Button>
        </motion.div>
      </div>
    </AnimatedSection>
  );
};
