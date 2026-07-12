import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createBrowserRouter, Link, Outlet } from 'react-router-dom'
import DashboardApp from './app/DashboardApp'
import Login from './app/pages/Login'
import ProtectedRoute from './app/components/ProtectedRoute'
import { AuthProvider } from './lib/auth'
import './styles/index.css'

// ─── 404 Page ─────────────────────────────────────────────────────────────────

function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      color: '#0f172a',
      fontFamily: 'Inter, sans-serif',
    }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 700 }}>404</h1>
      <p style={{ color: '#64748b' }}>Page not found</p>
      <Link to="/dashboard" style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 16px',
        borderRadius: '8px',
        background: '#2563eb',
        color: '#fff',
        textDecoration: 'none',
        fontWeight: 500,
      }}>Back to Dashboard</Link>
    </div>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────

const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      { path: '/login', element: <Login /> },
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <DashboardApp />
          </ProtectedRoute>
        )
      },
      { path: '*', element: <NotFoundPage /> }
    ]
  }
]);

// ─── Query Client ─────────────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
    },
  },
});

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
