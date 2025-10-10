import React from "react";
import { motion } from "framer-motion";
import { LoadingSpinner } from "@/components/ui/loading";

const LoadingPage = ({ message = "Loading Red Tetris..." }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center"
      >
        {/* Logo */}
        <motion.div variants={logoVariants} className="mb-8">
          <div className="relative mx-auto w-20 h-20 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-2xl shadow-primary/30">
            <span className="text-background">T</span>
            {/* Animated glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl"
              animate={{
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>

        {/* Loading spinner */}
        <motion.div variants={itemVariants} className="mb-6">
          <LoadingSpinner size="lg" className="mx-auto" />
        </motion.div>

        {/* Message */}
        <motion.div variants={itemVariants}>
          <h1 className="text-xl font-semibold text-foreground mb-2">
            {message}
          </h1>
          <p className="text-muted-foreground text-sm">
            Preparing your gaming experience...
          </p>
        </motion.div>

        {/* Loading dots */}
        <motion.div 
          variants={itemVariants}
          className="flex justify-center mt-8 space-x-1"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-primary/60 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoadingPage;
