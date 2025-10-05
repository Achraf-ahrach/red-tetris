import React from "react"
import { Outlet } from "react-router-dom"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

export const AuthLayout = ({ 
  title, 
  description, 
  footerContent 
}) => {
  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${20 + i * 20}%`,
              top: "-50px",
            }}
            animate={{
              y: ["0vh", "110vh"],
              rotate: [0, 360],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
              delay: i * 2,
            }}
          >
            <div className="w-8 h-8 bg-secondary rounded" />
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >

        {/* Auth Card */}
        <Card className="border-border/50 backdrop-blur-sm bg-card/95 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center">{title}</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              {description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
           <Outlet/>
          </CardContent>

          {footerContent && (
            <CardFooter className="flex flex-col space-y-4">
              {footerContent}
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
