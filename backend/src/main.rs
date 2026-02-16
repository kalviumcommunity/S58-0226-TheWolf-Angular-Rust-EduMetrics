use actix_web::{get, web, App, HttpResponse, HttpServer, Responder};
use serde::Serialize;

// Health check endpoint
#[get("/")]
async fn hello() -> impl Responder {
    "🚀 Rust Backend is Running! EduMetrics API v1.0"
}

// API health check with JSON
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

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("🔥 Starting EduMetrics Backend Server...");
    println!("🌐 Server running at: http://127.0.0.1:8080");
    println!("📊 Health check: http://127.0.0.1:8080/api/health");
    
    HttpServer::new(|| {
        App::new()
            .service(hello)
            .service(health_check)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}