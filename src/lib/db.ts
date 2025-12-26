import sql from 'mssql'

// SQL Server configuration - SQL Server Authentication
const config: sql.config = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'DB_GoClean',
    user: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    options: {
        encrypt: false, // Set false untuk local SQL Server
        trustServerCertificate: true,
        enableArithAbort: true
    }
}

// Connection pool singleton
let pool: sql.ConnectionPool | null = null

/**
 * Get or create database connection pool
 */
export async function getPool(): Promise<sql.ConnectionPool> {
    if (!pool) {
        pool = await sql.connect(config)
    }
    return pool
}

/**
 * Execute raw SQL query
 * @param query - SQL query string
 * @param params - Query parameters (optional)
 */
export async function executeQuery<T = any>(
    query: string,
    params?: Record<string, any>
): Promise<T[]> {
    try {
        const pool = await getPool()
        const request = pool.request()

        // Add parameters if provided
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                request.input(key, value)
            })
        }

        const result = await request.query(query)
        return result.recordset as T[]
    } catch (error) {
        console.error('Database query error:', error)
        throw error
    }
}

/**
 * Execute query and return single result
 */
export async function executeQuerySingle<T = any>(
    query: string,
    params?: Record<string, any>
): Promise<T | null> {
    const results = await executeQuery<T>(query, params)
    return results.length > 0 ? results[0] : null
}

/**
 * Close database connection
 */
export async function closePool(): Promise<void> {
    if (pool) {
        await pool.close()
        pool = null
    }
}

export default { getPool, executeQuery, executeQuerySingle, closePool }
