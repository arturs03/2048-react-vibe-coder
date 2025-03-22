import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { Layout } from '@components/layout/Layout'
import { Home } from '@pages/Home'
import { Game } from '@pages/Game'
import { Scoreboard } from '@pages/Scoreboard'

const rootRoute = createRootRoute({
  component: Layout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
})

const gameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/game',
  component: Game,
})

const scoreboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scoreboard',
  component: Scoreboard,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  gameRoute,
  scoreboardRoute,
])

export const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function RouterConfig() {
  return <RouterProvider router={router} />
} 