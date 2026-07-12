import 'dotenv/config'
import express, { Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import prisma from './lib/prisma'
import { errorHandler } from './middleware/errorHandler'
import authRoutes from './modules/auth/auth.routes'
import vehicleRoutes from './modules/vehicles/vehicle.routes'
import driverRoutes from './modules/drivers/driver.routes'
import tripRoutes from './modules/trips/trip.routes'
import maintenanceRoutes from './modules/maintenance/maintenance.routes'
import fuelRoutes from './modules/fuel/fuel.routes'
import expenseRoutes from './modules/expenses/expense.routes'
import reportsRoutes from './modules/reports/reports.routes'

const app = express()
const PORT = parseInt(process.env.PORT ?? '3001', 10)
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173'
const NODE_ENV = process.env.NODE_ENV ?? 'development'

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet())
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/vehicles', vehicleRoutes)
app.use('/api/drivers', driverRoutes)
app.use('/api/trips', tripRoutes)
app.use('/api/maintenance', maintenanceRoutes)
app.use('/api/fuel', fuelRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/reports', reportsRoutes)

/**
 * GET /health and /api/health
 * Returns the service health status. Used by the frontend to verify connectivity.
 */
app.get(['/health', '/api/health'], async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'TransitOps API',
      version: '1.0.0',
      environment: NODE_ENV,
      database: 'connected',
      uptime: Math.floor(process.uptime()),
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'TransitOps API is running, but database connection failed',
      database: 'disconnected',
      error: error instanceof Error ? error.message : String(error),
    })
  }
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
    message: 'Welcome to the TransitOps API.',
  })
})

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorHandler)

// ─── Start ────────────────────────────────────────────────────────────────────
if (NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n🚌 TransitOps API running on http://localhost:${PORT}`)
    console.log(`   Environment : ${NODE_ENV}`)
    console.log(`   CORS origin : ${CORS_ORIGIN}`)
    console.log(`   Health check: http://localhost:${PORT}/health\n`)
  })
}

export default app
