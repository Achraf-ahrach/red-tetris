import React from "react";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/ui/page-transition";

const NotFoundPage = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <PageTransition variant="scale">
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-background/95">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-lg w-full text-center"
        >
          {/* 404 Number */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-8xl md:text-9xl font-bold text-primary/20 select-none">
              404
            </h1>
          </motion.div>

          {/* Icon */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 text-primary" />
            </div>
          </motion.div>

          {/* Text */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Page Not Found
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              The page you're looking for doesn't exist or has been moved. Let's
              get you back to where you need to be.
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              size="lg"
              className="flex items-center gap-2 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </Button>
            <Button
              onClick={() => navigate("/")}
              size="lg"
              className="flex items-center gap-2 group"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </motion.div>

          {/* Help Text */}
          <motion.div variants={itemVariants} className="mt-12">
            <p className="text-sm text-muted-foreground">
              Need help? Press{" "}
              <kbd className="px-2 py-1 text-xs bg-muted border rounded">?</kbd>{" "}
              to see keyboard shortcuts
            </p>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default NotFoundPage;
