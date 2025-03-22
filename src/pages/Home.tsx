import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'

export function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-12 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          Play 2048 in
          <span className="text-primary"> Hexagonal </span>
          Grid
        </h1>
        <p className="mx-auto max-w-[700px] text-lg text-muted-foreground sm:text-xl">
          A unique twist on the classic 2048 game. Merge tiles, create higher numbers,
          and compete with players worldwide on our real-time leaderboard.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
      >
        <Link
          to="/game"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          Play Now
        </Link>
        <Link
          to="/scoreboard"
          className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          View Scoreboard
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="text-lg font-semibold">Hexagonal Grid</h3>
          <p className="text-sm text-muted-foreground">
            Play on a unique hexagonal board that adds new strategic dimensions to the game.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="text-lg font-semibold">Smooth Controls</h3>
          <p className="text-sm text-muted-foreground">
            Use arrow keys or swipe gestures for intuitive gameplay at 60fps.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="text-lg font-semibold">Global Competition</h3>
          <p className="text-sm text-muted-foreground">
            Compete with players worldwide and see your score on the real-time leaderboard.
          </p>
        </div>
      </motion.div>
    </div>
  )
} 