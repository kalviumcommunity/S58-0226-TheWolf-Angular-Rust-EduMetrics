use actix_web::{get, App, HttpResponse, HttpServer, Responder};
use serde::Serialize;

// ============================================================
// HEALTH CHECK RESPONSE STRUCT
// ============================================================
#[derive(Serialize)]
struct HealthResponse {
    status: String,
    message: String,
    service: String,
    version: String,
}

// ============================================================
// ROOT ENDPOINT - Basic status check
// ============================================================
#[get("/")]
async fn root_status() -> impl Responder {
    "🚀 EduMetrics API is Running! Visit /health for status."
}

// ============================================================
// HEALTH CHECK ENDPOINT - /health
// ============================================================
#[get("/health")]
async fn health_check() -> impl Responder {
    let response = HealthResponse {
        status: "OK".to_string(),
        message: "Backend is operational".to_string(),
        service: "EduMetrics Student Analytics Engine".to_string(),
        version: "1.0.0".to_string(),
    };
    HttpResponse::Ok().json(response)
}

// ============================================================
// STATUS ENDPOINT - /status (detailed check)
// ============================================================
#[derive(Serialize)]
struct StatusResponse {
    status: String,
    uptime: String,
    endpoints: Vec<String>,
}

#[get("/status")]
async fn server_status() -> impl Responder {
    let response = StatusResponse {
        status: "running".to_string(),
        uptime: "active".to_string(),
        endpoints: vec![
            "GET /".to_string(),
            "GET /health".to_string(),
            "GET /status".to_string(),
        ],
    };
    HttpResponse::Ok().json(response)
}

// ============================================================
// STRUCTURED STARTUP LOG
// ============================================================
#[derive(Serialize)]
struct StartupLog {
    level: String,
    message: String,
    server_url: String,
    health_endpoint: String,
    status_endpoint: String,
}

// ============================================================
// MAIN FUNCTION - Server Entry Point
// ============================================================
#[actix_web::main]
async fn main() -> std::io::Result<()> {

    // Structured JSON startup log
    let startup_log = StartupLog {
        level: "INFO".to_string(),
        message: "Starting EduMetrics Backend Server".to_string(),
        server_url: "http://127.0.0.1:8080".to_string(),
        health_endpoint: "http://127.0.0.1:8080/health".to_string(),
        status_endpoint: "http://127.0.0.1:8080/status".to_string(),
    };

    println!("{}", serde_json::to_string(&startup_log).unwrap());

    // Start HTTP Server
    HttpServer::new(|| {
        App::new()
            .service(root_status)
            .service(health_check)
            .service(server_status)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}