import { motion } from 'framer-motion'

export function Scoreboard() {
  return (
    <div className="flex flex-col space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold">Global Leaderboard</h1>
        <p className="text-muted-foreground">
          Top scores from players around the world
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="rounded-lg border bg-card"
      >
        <div className="p-4">
          <div className="grid grid-cols-4 gap-4 border-b pb-4 font-medium">
            <div>Rank</div>
            <div>Player</div>
            <div className="text-right">Score</div>
            <div className="text-right">Date</div>
          </div>
          <div className="divide-y">
            {/* Placeholder for scores */}
            <div className="grid grid-cols-4 gap-4 py-4">
              <div className="font-medium">#1</div>
              <div className="text-muted-foreground">Loading...</div>
              <div className="text-right text-muted-foreground">-</div>
              <div className="text-right text-muted-foreground">-</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 