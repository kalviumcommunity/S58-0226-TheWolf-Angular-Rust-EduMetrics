//src/db.rs
use sqlx::postgres::PgPoolOptions;
use sqlx::{PgPool, Error};
use std::env;

// ============================================================
// DATABASE CONNECTION POOL
// ============================================================

/// Create and return a PostgreSQL connection pool
pub async fn create_pool() -> Result<PgPool, Error> {
    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set in .env file");

    let max_connections = env::var("DATABASE_MAX_CONNECTIONS")
        .unwrap_or_else(|_| "5".to_string())
        .parse::<u32>()
        .unwrap_or(5);

    println!("🔌 Connecting to database...");
    println!("📊 Max connections: {}", max_connections);

    let pool = PgPoolOptions::new()
        .max_connections(max_connections)
        .connect(&database_url)
        .await?;

    println!("✅ Database connection pool created successfully");

    Ok(pool)
}

// ============================================================
// RUN MIGRATIONS
// ============================================================

/// Run database migrations
pub async fn run_migrations(pool: &PgPool) -> Result<(), Error> {
    println!("🔄 Running database migrations...");
    
    sqlx::migrate!("./migrations")
        .run(pool)
        .await?;

    println!("✅ Migrations completed successfully");

    Ok(())
}

// ============================================================
// DATABASE HEALTH CHECK
// ============================================================

/// Check if database is accessible
pub async fn check_connection(pool: &PgPool) -> Result<bool, Error> {
    sqlx::query("SELECT 1")
        .fetch_one(pool)
        .await?;

    Ok(true)
}