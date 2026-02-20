use actix_web::{get, middleware, web, App, HttpResponse, HttpServer, Responder};
use serde::Serialize;
use std::env;

mod models;
mod db;
mod handlers;

use models::*;

// ============================================================
// HEALTH CHECK WITH DATABASE STATUS
// ============================================================
#[derive(Serialize)]
struct HealthResponse {
    status: String,
    message: String,
    service: String,
    version: String,
    database: String,
}

#[get("/health")]
async fn health_check(pool: web::Data<sqlx::PgPool>) -> impl Responder {
    let db_status = match db::check_connection(pool.get_ref()).await {
        Ok(_) => "connected",
        Err(_) => "disconnected",
    };

    let response = HealthResponse {
        status: "OK".to_string(),
        message: "Backend is operational".to_string(),
        service: "EduMetrics Student Analytics Engine".to_string(),
        version: "1.0.0".to_string(),
        database: db_status.to_string(),
    };

    HttpResponse::Ok().json(response)
}

// ============================================================
// STARTUP LOG
// ============================================================
#[derive(Serialize)]
struct StartupLog {
    level: String,
    message: String,
    environment: String,
    server_url: String,
    database_status: String,
}

// ============================================================
// MAIN FUNCTION
// ============================================================
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();

    let host = env::var("SERVER_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let port = env::var("SERVER_PORT").unwrap_or_else(|_| "8080".to_string());
    let bind_address = format!("{}:{}", host, port);

    // Create database connection pool
    let pool = match db::create_pool().await {
        Ok(pool) => {
            println!("✅ Database pool created");
            pool
        }
        Err(e) => {
            eprintln!("❌ Failed to create database pool: {:?}", e);
            std::process::exit(1);
        }
    };

    // Run migrations
    if let Err(e) = db::run_migrations(&pool).await {
        eprintln!("❌ Failed to run migrations: {:?}", e);
        std::process::exit(1);
    }

    let startup_log = StartupLog {
        level: "INFO".to_string(),
        message: "EduMetrics Backend with PostgreSQL".to_string(),
        environment: "development".to_string(),
        server_url: format!("http://{}:{}", host, port),
        database_status: "connected".to_string(),
    };

    println!("{}", serde_json::to_string(&startup_log).unwrap());

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(pool.clone()))
            .wrap(middleware::Logger::default())
            .service(health_check)
            .service(
                web::scope("/api")
                    .route("/students", web::get().to(handlers::get_all_students))
                    .route("/students", web::post().to(handlers::create_student))
                    .route("/students/{id}", web::get().to(handlers::get_student_by_id))
                    .route("/students/{id}", web::put().to(handlers::update_student))
                    .route("/students/{id}", web::delete().to(handlers::delete_student))
            )
    })
    .bind(&bind_address)?
    .run()
    .await
}