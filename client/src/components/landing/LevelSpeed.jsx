import { AnimatedSection } from "../AnimatedSection"
import { Badge } from "../ui/badge"



export const LevelSpeed = () => {
  return (
       <AnimatedSection className="py-20 bg-muted/20" id="levels" variant="scale">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-secondary text-secondary-foreground">Levels & Speed</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              <span className="text-secondary">Progressive</span> Difficulty
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              {
                "Challenge yourself with increasing speeds and complex patterns. Each level brings new excitement and tests your reflexes."
              }
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { level: "1-5", speed: "Beginner", color: "#00ff00", description: "Learn the basics with gentle speeds" },
              {
                level: "6-10",
                speed: "Intermediate",
                color: "#ffff00",
                description: "Faster drops, strategic thinking required",
              },
              { level: "11+", speed: "Expert", color: "#ff8800", description: "Lightning fast, only for masters" },
            ].map((item, i) => (
              <motion.div key={i} whileHover={{ scale: 1.05, y: -10 }} transition={{ duration: 0.3 }}>
                <Card className="p-6 bg-card/50 backdrop-blur-sm border-2 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <TetrisBlock color={item.color} size={24} />
                    <div>
                      <h3 className="text-xl font-bold">Level {item.level}</h3>
                      <p className="text-sm text-muted-foreground">{item.speed}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{item.description}</p>

                  <div className="mt-4 flex gap-1">
                    {Array.from({ length: 10 }).map((_, j) => (
                      <motion.div
                        key={j}
                        className="h-2 bg-muted rounded-full flex-1"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: j < (i + 1) * 3 ? 1 : 0.3 }}
                        transition={{ duration: 0.5, delay: j * 0.1 }}
                        style={{ backgroundColor: j < (i + 1) * 3 ? item.color : undefined }}
                      />
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>
  )
}