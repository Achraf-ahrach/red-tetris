import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, ChevronLeft, ChevronRight } from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export default function AchievementsGrid({
  achievements,
  userData,
  variants,
  showTitle = true,
}) {
  const items = achievements ?? userData?.achievements ?? [];
  const carouselRef = useRef(null);

  const scrollAmount = () => (carouselRef.current?.clientWidth || 300) * 0.9;
  const scrollLeft = () =>
    carouselRef.current?.scrollBy({
      left: -scrollAmount(),
      behavior: "smooth",
    });
  const scrollRight = () =>
    carouselRef.current?.scrollBy({ left: scrollAmount(), behavior: "smooth" });

  return (
    <motion.div
      variants={variants || staggerContainer}
      initial="initial"
      animate="animate"
      className="mb-10"
    >
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Award className="w-4 h-4 text-muted-foreground " />
            Achievements
            <span className="text-xs text-muted-foreground font-normal">
              ({items.length})
            </span>
          </h2>

          {items.length > 0 && (
            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                aria-label="Scroll left"
                onClick={scrollLeft}
                className="h-8 w-8 inline-flex items-center justify-center rounded-md border bg-card hover:bg-accent hover:text-accent-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Scroll right"
                onClick={scrollRight}
                className="h-8 w-8 inline-flex items-center justify-center rounded-md border bg-card hover:bg-accent hover:text-accent-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Carousel */}
      <div className="relative">
        {/* Edge fades */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-background to-transparent rounded-l-md" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-background to-transparent rounded-r-md" />

        <div
          ref={carouselRef}
          className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth no-scrollbar  px-3 md:px-5"
        >
          {items.map((achievement) => {
            const description =
              achievement.description ||
              achievement.hint ||
              "Unlock this by completing its challenge.";
            return (
              <motion.div
                key={achievement.id || achievement.name}
                variants={fadeInUp}
                className="snap-start shrink-0 w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px]"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 360, damping: 18 }}
              >
                <Card
                  className={`group relative p-4 text-center mt-5 ${
                    achievement.unlocked
                      ? "bg-card/60 backdrop-blur-sm border-primary/30 shadow shadow-primary/10"
                      : "bg-card/30 backdrop-blur-sm border-muted/30 opacity-60"
                  } hover:border-primary transition-all`}
                  title={description}
                >
                  <div className="text-2xl mb-2">{achievement.icon}</div>
                  <div className="text-xs font-semibold mb-1 line-clamp-1">
                    {achievement.name}
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-4 px-1.5 ${
                      achievement.rarity === "mythic"
                        ? "border-purple-500 text-purple-400 bg-purple-500/10"
                        : achievement.rarity === "legendary"
                        ? "border-yellow-500 text-yellow-400 bg-yellow-500/10"
                        : achievement.rarity === "epic"
                        ? "border-pink-500 text-pink-400 bg-pink-500/10"
                        : achievement.rarity === "rare"
                        ? "border-blue-500 text-blue-400 bg-blue-500/10"
                        : "border-gray-500 text-gray-400 bg-gray-500/10"
                    }`}
                  >
                    {achievement.rarity}
                  </Badge>

                  {/* Inline description inside the card */}
                  <div className="mt-2 text-[11px] text-muted-foreground leading-snug line-clamp-2">
                    {description}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
