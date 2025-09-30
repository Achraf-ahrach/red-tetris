


import { motion, useScroll, useTransform, useInView } from "motion/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useEffect, useState } from "react"

// Enhanced game mode card component for carousel
const GameModeCard = ({ title, description, image, color }) => {
  return (
    <motion.div
      className="group relative min-w-0 flex-shrink-0 w-full"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
      {/* Card container */}
      <div className="relative bg-card/60 backdrop-blur-md border border-border/50 rounded-3xl p-6 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/15 overflow-hidden h-full">
        {/* Enhanced background glow */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-25 transition-opacity duration-700 blur-2xl"
          style={{ 
            background: `radial-gradient(circle at center, ${color}50 0%, ${color}20 40%, transparent 70%)` 
          }}
        />
        
        {/* Subtle gradient overlay */}
        <div 
          className="absolute inset-0 opacity-10 rounded-3xl"
          style={{ 
            background: `linear-gradient(135deg, ${color}30 0%, transparent 50%, ${color}20 100%)` 
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 text-center h-full flex flex-col">
          {/* Enhanced Icon */}
          <motion.div
            className="text-5xl mb-4 relative inline-block"
            whileHover={{ 
              scale: 1.1,
              rotate: [0, -5, 5, 0],
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Multi-layered glow */}
            <div 
              className="absolute inset-0 rounded-full blur-xl opacity-50"
              style={{ background: `${color}80` }}
            />
            <div 
              className="absolute inset-0 rounded-full blur-lg opacity-30"
              style={{ background: `${color}` }}
            />
            <div className="relative z-10 drop-shadow-lg">{image}</div>
          </motion.div>

          {/* Enhanced Title */}
          <h3 
            className="text-xl font-bold mb-3 group-hover:scale-105 transition-all duration-300"
            style={{ 
              color: color
            }}
          >
            {title}
          </h3>

          {/* Enhanced Description */}
          <p className="text-muted-foreground/90 leading-relaxed mb-6 text-sm font-light group-hover:text-muted-foreground transition-colors duration-300 flex-grow">
            {description}
          </p>

          {/* Enhanced Button */}
          <Button 
            size="sm"
            className="px-6 py-2 font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 group relative overflow-hidden w-full"
            style={{ 
              backgroundColor: `${color}15`,
              borderColor: `${color}40`,
              color: color
            }}
          >
            {/* Button glow effect */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"
              style={{ background: `${color}20` }}
            />
            <div className="relative z-10 flex items-center gap-2 justify-center">
              <Play className="w-4 h-4" />
              <span>Play Now</span>
            </div>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// Horizontal Carousel Component - Multiple Cards View
const HorizontalCarousel = ({ children, totalItems }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const containerRef = useRef(null)
  
  // Responsive cards per view
  const [cardsPerView, setCardsPerView] = useState(3)
  const maxIndex = Math.max(0, totalItems - cardsPerView)

  // Update cards per view based on screen size
  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth < 768) {
        setCardsPerView(1) // Mobile: 1 card
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2) // Tablet: 2 cards
      } else {
        setCardsPerView(3) // Desktop: 3 cards
      }
    }

    updateCardsPerView()
    window.addEventListener('resize', updateCardsPerView)
    return () => window.removeEventListener('resize', updateCardsPerView)
  }, [])

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || maxIndex === 0) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1
        return next > maxIndex ? 0 : next
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, maxIndex])

  const goToSlide = (index) => {
    setCurrentIndex(Math.min(index, maxIndex))
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 8000)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 8000)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 8000)
  }

  // Calculate the transform percentage
  const translateX = -(currentIndex * (100 / cardsPerView))

  return (
    <div className="relative max-w-7xl mx-auto">
      {/* Carousel Container */}
      <div 
        ref={containerRef}
        className="overflow-hidden rounded-2xl"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <motion.div
          className="flex gap-6"
          animate={{ x: `${translateX}%` }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ width: `${(totalItems / cardsPerView) * 100}%` }}
        >
          {children}
        </motion.div>
      </div>

      {/* Navigation Arrows - Only show if there are more cards than visible */}
      {maxIndex > 0 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 shadow-lg"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 shadow-lg"
            onClick={goToNext}
            disabled={currentIndex === maxIndex}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Dot Indicators - Only show if there are multiple slides */}
      {maxIndex > 0 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-primary scale-150 shadow-lg'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {maxIndex > 0 && (
        <div className="mt-4 h-1 bg-muted-foreground/20 rounded-full overflow-hidden max-w-md mx-auto">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${((currentIndex / maxIndex) * 100)}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}
    </div>
  )
}

// Game modes data
const gameModes = [
  {
    title: "Classic Mode",
    description: "Experience the timeless Tetris gameplay with falling blocks, line clearing, and increasing speed. Perfect for beginners and veterans alike.",
    image: "🎯",
    color: "#00f5ff"
  },
  {
    title: "Speed Challenge",
    description: "Test your reflexes in high-speed gameplay where blocks fall faster than ever. Only the quickest players survive the ultimate challenge.",
    image: "⚡",
    color: "#ffff00"
  },
  {
    title: "Multiplayer Battle",
    description: "Face off against players worldwide in intense real-time battles. Send garbage blocks and defend your board to claim victory.",
    image: "⚔️",
    color: "#ff8800"
  },
  {
    title: "Puzzle Mode",
    description: "Solve carefully crafted puzzles with limited moves. Think strategically to clear specific patterns and unlock complex challenges.",
    image: "🧩",
    color: "#aa00ff"
  },
  {
    title: "Marathon Mode",
    description: "How long can you survive? Play endlessly as the speed gradually increases. Perfect for setting new personal records.",
    image: "🏃",
    color: "#00ff00"
  },
  {
    title: "Time Attack",
    description: "Race against the clock to clear as many lines as possible. Every second counts in this adrenaline-pumping game mode.",
    image: "⏰",
    color: "#0088ff"
  },
  {
    title: "Zen Mode",
    description: "Relax and enjoy Tetris without pressure. No time limits, no speed increases - just pure, meditative block-stacking bliss.",
    image: "🧘",
    color: "#ff0000"
  }
]


export const GameModes = () => {
  return (
    <section className="py-20" id="game-modes">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Badge className="mb-6 bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-primary/20 px-4 py-2">
              🎮 Game Modes
            </Badge>
          </motion.div>
          
          <motion.h2 
            className="text-4xl md:text-6xl font-bold mb-6 text-balance"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Choose Your <span className="text-primary">Adventure</span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            From classic puzzle challenges to intense multiplayer battles - 
            discover seven unique ways to experience the world's most beloved puzzle game
          </motion.p>
        </div>

        {/* Game Modes Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <HorizontalCarousel totalItems={gameModes.length}>
            {gameModes.map((mode, index) => (
              <GameModeCard
                key={mode.title}
                title={mode.title}
                description={mode.description}
                image={mode.image}
                color={mode.color}
              />
            ))}
          </HorizontalCarousel>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <p className="text-muted-foreground mb-8">
            Ready to start your Tetris journey?
          </p>
          <Button size="lg" className="px-8 py-3 text-lg">
            <Play className="w-5 h-5 mr-2" />
            Start Playing Now
          </Button>
        </motion.div>
      </div>
    </section>
  )
}