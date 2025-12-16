import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg'

// Connection pool for PostgreSQL
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'postgres',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'claude_tokens',
  user: process.env.POSTGRES_USER || 'claude',
  password: process.env.POSTGRES_PASSWORD,
  max: 20, // Maximum connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Test connection on startup
pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client', err)
})

// Query helper with automatic connection handling
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const start = Date.now()
  try {
    const result = await pool.query<T>(text, params)
    const duration = Date.now() - start
    if (process.env.NODE_ENV !== 'production') {
      console.log('[DB] Query executed', { text: text.substring(0, 50), duration, rows: result.rowCount })
    }
    return result
  } catch (error) {
    console.error('[DB] Query error', { text: text.substring(0, 50), error })
    throw error
  }
}

// Get a client for transactions
export async function getClient(): Promise<PoolClient> {
  const client = await pool.connect()
  return client
}

// Health check
export async function checkConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1')
    return true
  } catch {
    return false
  }
}

// Graceful shutdown
export async function closePool(): Promise<void> {
  await pool.end()
}

export { pool }
