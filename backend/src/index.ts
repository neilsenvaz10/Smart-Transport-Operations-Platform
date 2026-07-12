import 'dotenv/config'
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

// ─── App Configuration ────────────────────────────────────────────────────────

const app = express()
const PORT = parseInt(process.env.PORT ?? '3001', 10)
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173'
const NODE_ENV = process.env.NODE_ENV ?? 'development'

// ─── Middleware ───────────────────────────────────────────────────────────────

// Security headers
app.use(helmet())

// CORS – allow the Vite dev server
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)

// Request logging (compact in production, dev-friendly in development)
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'))

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /health
 * Returns the service health status. Used by the frontend to verify connectivity.
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'TransitOps API',
    version: '1.0.0',
    environment: NODE_ENV,
    uptime: Math.floor(process.uptime()),
  })
})

/**
 * GET /
 * Root route — confirms the API is running.
 */
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'TransitOps API',
    version: '1.0.0',
    docs: '/health',
    message: 'Welcome to the TransitOps API. Phase 1 setup complete.',
  })
})

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  })
})

// ─── Error Handler ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error]', err.message)
  res.status(500).json({
    status: 'error',
    message: NODE_ENV === 'production' ? 'Internal server error' : err.message,
  })
})

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚌 TransitOps API running on http://localhost:${PORT}`)
  console.log(`   Environment : ${NODE_ENV}`)
  console.log(`   CORS origin : ${CORS_ORIGIN}`)
  console.log(`   Health check: http://localhost:${PORT}/health\n`)
})

export default app
