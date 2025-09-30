


import { motion, useScroll, useTransform, useInView } from "motion/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play } from "lucide-react"
import { useRef, useEffect, useState } from "react"

const FixedViewportCarousel = ({ children }) => {
  return (
    <div className="relative">
      <style jsx global>{`
        html {
          scroll-snap-type: y proximity;
          scroll-behavior: smooth;
        }
        
        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }
        }
      `}</style>
      <div className="h-[1800vh] relative">
        <div className="sticky top-0 h-screen overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}

const FixedGameCard = ({
  title,
  description,
  image,
  color,
  backgroundImage,
  index,
  totalCards,
  globalScrollProgress,
  carouselStarted,
}) => {
  // Calculate when this card should be visible
  const cardStart = index / totalCards
  const cardEnd = (index + 1) / totalCards
  
  // Card visibility - only show when it's this card's time AND carousel has started
  const isActive = useTransform(
    globalScrollProgress,
    [cardStart, cardEnd],
    [0, 1],
    { clamp: false }
  )
  
  // Check if this is the last card
  const isLastCard = index === totalCards - 1
  
  // Enhanced transitions that only work when carousel is active
  // Ultra-smooth opacity transitions with better easing curves
  const opacity = useTransform(
    globalScrollProgress,
    [cardStart - 0.06, cardStart - 0.02, cardStart - 0.005, cardStart + 0.005, cardEnd - 0.005, cardEnd + 0.02, cardEnd + 0.06],
    carouselStarted ? [0, 0.1, 0.7, 1, 1, isLastCard ? 1 : 0.1, isLastCard ? 1 : 0] : [0, 0, 0, 0, 0, 0, 0]
  )
  
  // Smoother entrance from bottom with better curve
  const y = useTransform(
    globalScrollProgress,
    [cardStart - 0.06, cardStart - 0.025, cardStart - 0.01, cardStart - 0.002, cardStart + 0.002, cardEnd - 0.01, cardEnd + 0.04],
    carouselStarted ? [120, 60, 25, 8, 0, 0, isLastCard ? 0 : 0] : [0, 0, 0, 0, 0, 0, 0]
  )
  
  // Horizontal slide - smoother exit to left (only if not last card)
  const x = useTransform(
    globalScrollProgress,
    [cardStart - 0.05, cardStart - 0.01, cardStart + 0.01, cardEnd - 0.04, cardEnd - 0.015, cardEnd - 0.005, cardEnd + 0.02],
    carouselStarted ? [0, 0, 0, 0, isLastCard ? 0 : -50, isLastCard ? 0 : -150, isLastCard ? 0 : -300] : [0, 0, 0, 0, 0, 0, 0]
  )
  
  // Gentler scale transitions with premium feel
  const scale = useTransform(
    globalScrollProgress,
    [cardStart - 0.05, cardStart - 0.02, cardStart - 0.005, cardStart + 0.005, cardEnd - 0.02, cardEnd + 0.02],
    carouselStarted ? [0.85, 0.95, 0.99, 1, isLastCard ? 1 : 0.9, isLastCard ? 1 : 0.7] : [1, 1, 1, 1, 1, 1]
  )
  
  // Minimal blur for crystal-clear readability
  const blur = useTransform(
    globalScrollProgress,
    [cardStart - 0.04, cardStart - 0.015, cardStart - 0.005, cardStart + 0.005, cardEnd - 0.005, cardEnd + 0.015, cardEnd + 0.04],
    carouselStarted ? [3, 1.5, 0.5, 0, 0, isLastCard ? 0 : 1.5, isLastCard ? 0 : 3] : [0, 0, 0, 0, 0, 0, 0]
  )
  
  // Subtle rotation for elegant transitions (no rotation for last card)
  const rotateZ = useTransform(
    globalScrollProgress,
    [cardStart - 0.04, cardStart - 0.01, cardStart + 0.01, cardEnd - 0.02, cardEnd - 0.005, cardEnd + 0.02],
    carouselStarted ? [3, 1, 0, 0, isLastCard ? 0 : -1.5, isLastCard ? 0 : -6] : [0, 0, 0, 0, 0, 0]
  )

  return (
    <motion.div
      style={{ 
        opacity,
        scale,
        x,
        y,
        rotateZ,
        filter: `blur(${blur}px)`,
        zIndex: Math.round(isActive.get() * 10) // Higher z-index when active
      }}
      className="absolute inset-0 flex items-center justify-center"
    >
      {/* Animated gradient background with parallax */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${color}25 0%, ${color}15 40%, transparent 70%)`,
          transform: `translateY(${y * 0.1}px)` // Subtle parallax effect
        }}
        animate={{
          background: [
            `radial-gradient(circle at 50% 50%, ${color}25 0%, ${color}15 40%, transparent 70%)`,
            `radial-gradient(circle at 60% 40%, ${color}30 0%, ${color}20 35%, transparent 65%)`,
            `radial-gradient(circle at 40% 60%, ${color}25 0%, ${color}15 40%, transparent 70%)`,
            `radial-gradient(circle at 50% 50%, ${color}25 0%, ${color}15 40%, transparent 70%)`
          ]
        }}
        transition={{
          duration: 5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut"
        }}
      />
      
      {/* Secondary animated background layer with counter parallax */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${color}20, ${color}10, transparent)`,
          transform: `translateY(${y * -0.05}px)` // Counter parallax for depth
        }}
        animate={{
          background: [
            `linear-gradient(135deg, ${color}20, ${color}10, transparent)`,
            `linear-gradient(225deg, ${color}15, ${color}08, transparent)`,
            `linear-gradient(315deg, ${color}20, ${color}12, transparent)`,
            `linear-gradient(45deg, ${color}18, ${color}10, transparent)`,
            `linear-gradient(135deg, ${color}20, ${color}10, transparent)`
          ]
        }}
        transition={{
          duration: 7,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut"
        }}
      />

      <div className="relative z-10 text-center max-w-2xl px-8">
        <motion.div
          className="text-8xl mb-8 relative"
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={carouselStarted ? {
            opacity: 1,
            scale: [0.8, 1.1, 1],
            y: [40, 0, 0],
            rotate: [0, 5, -5, 0]
          } : {
            opacity: 0,
            scale: 0.8,
            y: 40
          }}
          transition={{ 
            duration: carouselStarted ? 2.5 : 0.8,
            delay: 0.1,
            repeat: carouselStarted ? Number.POSITIVE_INFINITY : 0,
            ease: "easeInOut"
          }}
        >
          {/* Animated background glow for the emoji */}
          <motion.div
            className="absolute inset-0 rounded-full blur-2xl"
            style={{
              background: color,
              opacity: 0.5
            }}
            animate={{
              scale: [1.2, 1.8, 1.2],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut"
            }}
          />
          <div className="relative z-10">{image}</div>
        </motion.div>

        <motion.h3
          className="text-5xl font-bold mb-6 text-white drop-shadow-lg"
          style={{ 
            color,
            textShadow: `0 0 30px ${color}50, 0 0 60px ${color}30`
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={carouselStarted ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ 
            duration: 1.0, 
            delay: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          {title}
        </motion.h3>

        <motion.p
          className="text-xl text-gray-200 leading-relaxed mb-8 backdrop-blur-sm"
          initial={{ opacity: 0, y: 25 }}
          animate={carouselStarted ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
          transition={{ 
            duration: 1.0, 
            delay: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          {description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={carouselStarted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ 
            duration: 1.0, 
            delay: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          <Button 
            size="lg" 
            className="px-8 py-4 text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 backdrop-blur-sm border border-white/10" 
            style={{ 
              backgroundColor: `${color}ee`, 
              color: "#000",
              boxShadow: `0 8px 32px ${color}40`
            }}
          >
            <Play className="w-5 h-5 mr-2" />
            Play {title}
          </Button>
        </motion.div>
      </div>
  </motion.div>
  )
}


export const GameModes = () => {
  const sectionRef = useRef(null)
  const carouselTriggerRef = useRef(null)
  const [carouselStarted, setCarouselStarted] = useState(false)
  
  // Track when the first card comes into view
  const isInView = useInView(carouselTriggerRef, {
    threshold: 0.5,
    triggerOnce: true
  })
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  })

  useEffect(() => {
    if (isInView) {
      setCarouselStarted(true)
    }
  }, [isInView])

  useEffect(() => {
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => {
      document.documentElement.style.scrollBehavior = 'auto'
    }
  }, [])

  return (
    <div ref={sectionRef} className="relative mt-0">
        <div className="text-center py-12 relative z-10 h-screen flex flex-col justify-center bg-background">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Badge className="mb-4 bg-primary text-primary-foreground mx-auto">Game Modes</Badge>
          </motion.div>
          
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-4 text-balance"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Discover <span className="text-primary">Every Mode</span>
          </motion.h2>
          
          <motion.p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Scroll down to explore all game modes
          </motion.p>
          
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="w-6 h-10 border-2 border-primary/60 rounded-full mx-auto flex items-start justify-center pt-2"
            >
              <div className="w-1 h-3 bg-primary/60 rounded-full" />
            </motion.div>
          </motion.div>
        </div>

        <FixedViewportCarousel>
          <div ref={carouselTriggerRef}>
            <FixedGameCard
              index={0}
              totalCards={7}
              globalScrollProgress={scrollYProgress}
              carouselStarted={carouselStarted}
              title="Classic Mode"
              description="Experience the timeless Tetris gameplay with falling blocks, line clearing, and increasing speed. Perfect for beginners and veterans alike who want to master the fundamentals."
              image="🎯"
              color="#00f5ff"
              backgroundImage="retro tetris blocks falling in classic game board"
            />
          </div>
          <FixedGameCard
            index={1}
            totalCards={7}
            globalScrollProgress={scrollYProgress}
            carouselStarted={carouselStarted}
            title="Speed Challenge"
            description="Test your reflexes in high-speed gameplay where blocks fall faster than ever. Only the quickest players survive the ultimate challenge of lightning-fast decision making."
            image="⚡"
            color="#ffff00"
            backgroundImage="fast moving tetris pieces with speed lines and motion blur"
          />
          <FixedGameCard
            index={2}
            totalCards={7}
            globalScrollProgress={scrollYProgress}
            carouselStarted={carouselStarted}
            title="Multiplayer Battle"
            description="Face off against players worldwide in intense real-time battles. Send garbage blocks and defend your board to claim victory in competitive matches."
            image="⚔️"
            color="#ff8800"
            backgroundImage="two tetris boards side by side in battle mode"
          />
          <FixedGameCard
            index={3}
            totalCards={7}
            globalScrollProgress={scrollYProgress}
            carouselStarted={carouselStarted}
            title="Puzzle Mode"
            description="Solve carefully crafted puzzles with limited moves. Think strategically to clear specific patterns and unlock increasingly complex challenges."
            image="🧩"
            color="#aa00ff"
            backgroundImage="complex tetris puzzle patterns and geometric shapes"
          />
          <FixedGameCard
            index={4}
            totalCards={7}
            globalScrollProgress={scrollYProgress}
            carouselStarted={carouselStarted}
            title="Marathon Mode"
            description="How long can you survive? Play endlessly as the speed gradually increases. Perfect for setting new personal records and testing endurance."
            image="🏃"
            color="#00ff00"
            backgroundImage="endless tetris gameplay with increasing difficulty levels"
          />
          <FixedGameCard
            index={5}
            totalCards={7}
            globalScrollProgress={scrollYProgress}
            carouselStarted={carouselStarted}
            title="Time Attack"
            description="Race against the clock to clear as many lines as possible. Every second counts in this adrenaline-pumping game mode that rewards quick thinking."
            image="⏰"
            color="#0088ff"
            backgroundImage="digital clock and timer with tetris blocks racing"
          />
          <FixedGameCard
            index={6}
            totalCards={7}
            globalScrollProgress={scrollYProgress}
            carouselStarted={carouselStarted}
            title="Zen Mode"
            description="Relax and enjoy Tetris without pressure. No time limits, no speed increases - just pure, meditative block-stacking bliss for peaceful gameplay."
            image="🧘"
            color="#ff0000"
            backgroundImage="peaceful zen garden with floating tetris blocks"
          />
        </FixedViewportCarousel>
        
        {/* Scroll Progress Indicator */}
        <motion.div 
          className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50"
          initial={{ opacity: 0, x: 20 }}
          animate={carouselStarted ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="w-1 h-32 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="w-full bg-primary rounded-full origin-top"
              style={{ 
                scaleY: carouselStarted ? scrollYProgress : 0,
                height: "100%"
              }}
            />
          </div>
        </motion.div>
      </div>
  )
}