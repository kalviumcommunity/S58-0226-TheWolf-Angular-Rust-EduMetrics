use actix_web::{get, App, HttpResponse, HttpServer, Responder};
use serde::Serialize;
use std::env;

// ============================================================
// RESPONSE STRUCTS
// ============================================================
#[derive(Serialize)]
struct HealthResponse {
    status: String,
    message: String,
    service: String,
    version: String,
    environment: String,
}

#[derive(Serialize)]
struct StatusResponse {
    status: String,
    environment: String,
    host: String,
    port: String,
    endpoints: Vec<String>,
}

#[derive(Serialize)]
struct ConfigResponse {
    environment: String,
    api_version: String,
    log_level: String,
    cors_origins: String,
}

// ============================================================
// ROOT ENDPOINT
// ============================================================
#[get("/")]
async fn root_status() -> impl Responder {
    let app_env = env::var("APP_ENV")
        .unwrap_or_else(|_| "development".to_string());
    
    format!(
        "EduMetrics API is Running! Environment: {} | Visit /health for status.",
        app_env
    )
}

// ============================================================
// HEALTH CHECK ENDPOINT
// ============================================================
#[get("/health")]
async fn health_check() -> impl Responder {
    let app_env = env::var("APP_ENV")
        .unwrap_or_else(|_| "development".to_string());
    
    let response = HealthResponse {
        status: "OK".to_string(),
        message: "Backend is operational".to_string(),
        service: "EduMetrics Student Analytics Engine".to_string(),
        version: env::var("API_VERSION")
            .unwrap_or_else(|_| "1.0.0".to_string()),
        environment: app_env,
    };
    
    HttpResponse::Ok().json(response)
}

// ============================================================
// STATUS ENDPOINT
// ============================================================
#[get("/status")]
async fn server_status() -> impl Responder {
    let host = env::var("SERVER_HOST")
        .unwrap_or_else(|_| "127.0.0.1".to_string());
    let port = env::var("SERVER_PORT")
        .unwrap_or_else(|_| "8080".to_string());
    let app_env = env::var("APP_ENV")
        .unwrap_or_else(|_| "development".to_string());
    
    let response = StatusResponse {
        status: "running".to_string(),
        environment: app_env,
        host,
        port,
        endpoints: vec![
            "GET /".to_string(),
            "GET /health".to_string(),
            "GET /status".to_string(),
            "GET /config".to_string(),
        ],
    };
    
    HttpResponse::Ok().json(response)
}

// ============================================================
// CONFIG ENDPOINT (Development Only)
// ============================================================
#[get("/config")]
async fn show_config() -> impl Responder {
    let app_env = env::var("APP_ENV")
        .unwrap_or_else(|_| "development".to_string());
    
    // Only show config in development
    if app_env == "production" {
        return HttpResponse::Forbidden().json(
            serde_json::json!({
                "error": "Config endpoint disabled in production"
            })
        );
    }
    
    let response = ConfigResponse {
        environment: app_env,
        api_version: env::var("API_VERSION")
            .unwrap_or_else(|_| "v1".to_string()),
        log_level: env::var("LOG_LEVEL")
            .unwrap_or_else(|_| "debug".to_string()),
        cors_origins: env::var("ALLOWED_ORIGINS")
            .unwrap_or_else(|_| "http://localhost:4200".to_string()),
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
    environment: String,
    server_url: String,
    health_endpoint: String,
}

// ============================================================
// MAIN FUNCTION
// ============================================================
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    
    // Load .env file
    dotenv::dotenv().ok();
    
    // Read environment variables
    let host = env::var("SERVER_HOST")
        .unwrap_or_else(|_| "127.0.0.1".to_string());
    let port = env::var("SERVER_PORT")
        .unwrap_or_else(|_| "8080".to_string());
    let app_env = env::var("APP_ENV")
        .unwrap_or_else(|_| "development".to_string());
    
    let server_url = format!("http://{}:{}", host, port);
    let bind_address = format!("{}:{}", host, port);
    
    // Structured startup log
    let startup_log = StartupLog {
        level: "INFO".to_string(),
        message: "Starting EduMetrics Backend Server".to_string(),
        environment: app_env.clone(),
        server_url: server_url.clone(),
        health_endpoint: format!("{}/health", server_url),
    };
    
    println!("{}", serde_json::to_string(&startup_log).unwrap());
    
    // Start server
    HttpServer::new(|| {
        App::new()
            .service(root_status)
            .service(health_check)
            .service(server_status)
            .service(show_config)
    })
    .bind(&bind_address)?
    .run()
    .await
}