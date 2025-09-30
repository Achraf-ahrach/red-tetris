import { Trophy, Users, Zap } from "lucide-react"
import { AnimatedSection } from "../AnimatedSection"
import { ParallaxSection } from "../ParallaxSection"
import { Badge } from "../ui/badge"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { motion} from "motion/react"
import { TetrisBlock } from "../TetrisBlock"



export const MultiplayerMode = () => {

  return (
    <AnimatedSection className="py-20" id="multiplayer" variant="slideRight">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ParallaxSection offset={-30}>
              <div className="relative">
                <Card className="p-8 bg-card/50 backdrop-blur-sm border-accent/20">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-tetris-green rounded-full animate-pulse" />
                      <span className="text-sm">Player 1</span>
                    </div>
                    <span className="text-2xl font-bold text-accent">VS</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm">Player 2</span>
                      <div className="w-3 h-3 bg-tetris-orange rounded-full animate-pulse" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[0, 1].map((player) => (
                      <div key={player} className="grid grid-cols-8 gap-px">
                        {Array.from({ length: 80 }).map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: Math.random() > 0.6 ? 1 : 0.2 }}
                            transition={{ duration: 0.3, delay: i * 0.02 }}
                          >
                            <TetrisBlock color={player === 0 ? "#00ff00" : "#ff8800"} size={12} />
                          </motion.div>
                        ))}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </ParallaxSection>

            <div>
              <Badge className="mb-4 bg-accent text-accent-foreground">Multiplayer Mode</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
                Battle with
                <span className="text-accent"> Friends</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 text-pretty">
                {
                  "Compete in real-time multiplayer battles. Send garbage blocks to opponents, defend your board, and prove your Tetris mastery."
                }
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Users className="w-6 h-6 text-accent mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Real-time Battles</h3>
                    <p className="text-muted-foreground">Face off against players worldwide in intense 1v1 matches</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Zap className="w-6 h-6 text-accent mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Attack System</h3>
                    <p className="text-muted-foreground">Clear multiple lines to send garbage blocks to opponents</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Trophy className="w-6 h-6 text-accent mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Ranked Matches</h3>
                    <p className="text-muted-foreground">Climb the leaderboard and earn your place among legends</p>
                  </div>
                </div>
              </div>

              <Button className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90">
                <Users className="w-4 h-4 mr-2" />
                Join Battle
              </Button>
            </div>
          </div>
        </div>
      </AnimatedSection>
  )

}