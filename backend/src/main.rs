use actix_web::{get, post, middleware, web, App, HttpResponse, HttpServer, Responder}; 
use chrono::NaiveDate; 
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
// SERDE DEMONSTRATION ENDPOINTS
// ============================================================

#[derive(Serialize)]
struct SerdeDemo {
    title: String,
    description: String,
    example_json: serde_json::Value,
}

/// Demonstrate serialization (Rust → JSON)
#[get("/demo/serialize")]
async fn demo_serialize() -> impl Responder {
    let example = StudentResponse {
        id: 1,
        name: "Alice Johnson".to_string(),
        email: "alice@example.com".to_string(),
        status: EnrollmentStatus::Active,
        message: "This struct was serialized to JSON by Serde".to_string(),
    };
    
    HttpResponse::Ok().json(example)
}

/// Demonstrate deserialization (JSON → Rust)
#[post("/demo/deserialize")]
async fn demo_deserialize(req: web::Json<CreateStudentRequest>) -> impl Responder {
    let demo = SerdeDemo {
        title: "Deserialization Success".to_string(),
        description: format!(
            "Serde parsed JSON into CreateStudentRequest struct. Name: {}, Email: {}",
            req.name, req.email
        ),
        example_json: serde_json::json!({
            "received": {
                "name": req.name,
                "email": req.email,
                "enrollment_date": req.enrollment_date
            }
        }),
    };
    
    HttpResponse::Ok().json(demo)
}

/// Show automatic validation - invalid JSON rejected
#[post("/demo/validation")]
async fn demo_validation(req: web::Json<CreateStudentRequest>) -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "message": "If you see this, the JSON was valid!",
        "validated_data": {
            "name": req.name,
            "email": req.email,
            "enrollment_date": req.enrollment_date
        }
    }))
}

/// Show different response formats
#[get("/demo/formats/{format}")]
async fn demo_formats(format: web::Path<String>) -> impl Responder {
    let student = Student {
        id: 1,
        name: "Bob Smith".to_string(),
        email: "bob@example.com".to_string(),
        enrollment_date: NaiveDate::from_ymd_opt(2024, 1, 20).unwrap(),
        status: "active".to_string(),
        gpa: 3.5,
        performance_level: "good".to_string(),
    };
    
    match format.as_str() {
        "compact" => {
            let json = serde_json::to_string(&student).unwrap();
            HttpResponse::Ok().body(json)
        }
        "pretty" => {
            let json = serde_json::to_string_pretty(&student).unwrap();
            HttpResponse::Ok()
                .content_type("application/json")
                .body(json)
        }
        _ => HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Invalid format. Use 'compact' or 'pretty'"
        }))
    }
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
            .service(demo_serialize)
            .service(demo_deserialize)
            .service(demo_validation)
            .service(demo_formats)
            // .route("/demo/deserialize", web::post().to(demo_deserialize))
            // .route("/demo/validation", web::post().to(demo_validation))
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