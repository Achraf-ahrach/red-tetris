import { Trophy } from "lucide-react"
import { AnimatedSection } from "../AnimatedSection"
import { Badge } from "../ui/badge"
import { Card } from "../ui/card"
import {motion} from 'motion/react'




export const Leaderboard = () => {

  return (

     <AnimatedSection className="py-20 bg-muted/20" id="scores" variant="slideUp">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-tetris-purple text-background">High Scores & Achievements</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              <span className="text-tetris-purple">Leaderboard</span> Champions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {"Compete for the top spot and unlock achievements. Track your progress and celebrate your victories."}
            </p>
          </div>

          <div className="grid  gap-12">
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-tetris-purple" />
                Global Leaderboard
              </h3>

              <div className="space-y-4">
                {[
                  { rank: 1, name: "TetrisMaster", score: "2,847,650", badge: "🥇" },
                  { rank: 2, name: "BlockWizard", score: "2,234,890", badge: "🥈" },
                  { rank: 3, name: "LineClearing", score: "1,987,420", badge: "🥉" },
                  { rank: 4, name: "PuzzleKing", score: "1,756,330", badge: "🏆" },
                  { rank: 5, name: "StackMaster", score: "1,543,210", badge: "⭐" },
                ].map((player, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{player.badge}</span>
                      <div>
                        <p className="font-semibold">{player.name}</p>
                        <p className="text-sm text-muted-foreground">Rank #{player.rank}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-tetris-purple">{player.score}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </AnimatedSection>

  )
}