use actix_web::{get, web, App, HttpResponse, HttpServer, Responder};
use serde::Serialize;

mod models;
mod handlers;
mod routes;

// Root endpoint - returns service status
#[get("/")]
async fn root_status() -> impl Responder {
    "🚀 Rust Backend is Running! EduMetrics API v1.0"
}

// API health check with JSON response
#[derive(Serialize)]
struct HealthStatus {
    status: String,
    message: String,
    service: String,
}

#[get("/api/health")]
async fn health_check() -> impl Responder {
    let health = HealthStatus {
        status: "OK".to_string(),
        message: "Student Analytics Engine Running".to_string(),
        service: "EduMetrics Backend".to_string(),
    };
    HttpResponse::Ok().json(health)
}

// Structured startup log
#[derive(Serialize)]
struct StartupLog {
    level: String,
    message: String,
    server_url: String,
    health_endpoint: String,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Structured startup logging
    let startup_log = StartupLog {
        level: "INFO".to_string(),
        message: "Starting EduMetrics Backend Server".to_string(),
        server_url: "http://127.0.0.1:8080".to_string(),
        health_endpoint: "http://127.0.0.1:8080/api/health".to_string(),
    };
    
    println!("{}", serde_json::to_string(&startup_log).unwrap());
    
    HttpServer::new(|| {
        App::new()
            .service(root_status)
            .service(health_check)
            .service(
                web::scope("/api")
                    .configure(routes::student_routes)
            )
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}