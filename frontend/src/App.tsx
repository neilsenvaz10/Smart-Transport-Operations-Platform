import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createBrowserRouter, Link } from 'react-router-dom'
import DashboardApp from './app/DashboardApp'
import './styles/index.css'

// ─── 404 Page ─────────────────────────────────────────────────────────────────

function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      color: 'var(--foreground)',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 700 }}>404</h1>
      <p style={{ color: 'var(--muted-foreground)' }}>Page not found</p>
      <Link to="/" style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 16px',
        borderRadius: '8px',
        background: 'var(--primary)',
        color: 'var(--primary-foreground)',
        textDecoration: 'none',
        fontWeight: 500
      }}>Back home</Link>
    </div>
  )
}

// ─── Router ───────────────────────────────────────────────────────────────────

const router = createBrowserRouter([
  { path: '/', element: <DashboardApp /> },
  { path: '*', element: <NotFoundPage /> },
])

// ─── Query Client ─────────────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
    },
  },
})

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
