// src/main.rs

use actix_cors::Cors;
use actix_web::{
    get, post,
    web, App, HttpResponse, HttpServer, Responder,
};
use actix_web::middleware::Logger;
use chrono::NaiveDate;
use serde::Serialize;
use std::env;

mod models;
mod db;
mod handlers;
mod errors;
mod middleware;

use models::*;

// ── Health check (PUBLIC) ────────────────────────────────────
#[derive(Serialize)]
struct HealthResponse {
    status: String, message: String,
    service: String, version: String, database: String,
}

#[get("/health")]
async fn health_check(pool: web::Data<sqlx::PgPool>) -> impl Responder {
    let db_status = match db::check_connection(pool.get_ref()).await {
        Ok(_)  => "connected",
        Err(_) => "disconnected",
    };
    HttpResponse::Ok().json(HealthResponse {
        status: "OK".into(), message: "Backend is operational".into(),
        service: "EduMetrics Student Analytics Engine".into(),
        version: "1.0.0".into(), database: db_status.into(),
    })
}

#[derive(Serialize)]
struct StartupLog {
    level: String, message: String,
    environment: String, server_url: String, database_status: String,
}

#[derive(Serialize)]
struct SerdeDemo { title: String, description: String, example_json: serde_json::Value }

#[get("/demo/serialize")]
async fn demo_serialize() -> impl Responder {
    HttpResponse::Ok().json(StudentResponse {
        id: 1, name: "Alice Johnson".into(), email: "alice@example.com".into(),
        status: EnrollmentStatus::Active, message: "Serialized by Serde".into(),
    })
}

#[post("/demo/deserialize")]
async fn demo_deserialize(req: web::Json<CreateStudentRequest>) -> impl Responder {
    HttpResponse::Ok().json(SerdeDemo {
        title: "Deserialization Success".into(),
        description: format!("Name: {}, Email: {}", req.name, req.email),
        example_json: serde_json::json!({ "name": req.name, "email": req.email }),
    })
}

#[post("/demo/validation")]
async fn demo_validation(req: web::Json<CreateStudentRequest>) -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "message": "JSON was valid!",
        "validated_data": { "name": req.name, "email": req.email }
    }))
}

#[get("/demo/formats/{format}")]
async fn demo_formats(format: web::Path<String>) -> impl Responder {
    let student = Student {
        id: 1, name: "Bob Smith".into(), email: "bob@example.com".into(),
        enrollment_date: NaiveDate::from_ymd_opt(2024, 1, 20).unwrap(),
        status: "active".into(), gpa: 3.5, performance_level: "good".into(),
        phone: None, address: None, department: Some("Mathematics".into()),
    };
    match format.as_str() {
        "compact" => HttpResponse::Ok().body(serde_json::to_string(&student).unwrap()),
        "pretty"  => HttpResponse::Ok().content_type("application/json")
                         .body(serde_json::to_string_pretty(&student).unwrap()),
        _ => HttpResponse::BadRequest().json(serde_json::json!({"error": "Use 'compact' or 'pretty'"})),
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();

    let host         = env::var("SERVER_HOST").unwrap_or_else(|_| "127.0.0.1".into());
    let port         = env::var("SERVER_PORT").unwrap_or_else(|_| "8080".into());
    let bind_address = format!("{}:{}", host, port);

    let pool = match db::create_pool().await {
        Ok(p)  => { println!("✅ Database pool created"); p }
        Err(e) => { eprintln!("❌ Pool error: {:?}", e); std::process::exit(1); }
    };

    if let Err(e) = db::run_migrations(&pool).await {
        eprintln!("❌ Migration error: {:?}", e);
        std::process::exit(1);
    }

    println!("{}", serde_json::to_string(&StartupLog {
        level: "INFO".into(),
        message: "EduMetrics — Security Middleware enabled (Assignment 3.32)".into(),
        environment: "development".into(),
        server_url: format!("http://{}:{}", host, port),
        database_status: "connected".into(),
    }).unwrap());

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(pool.clone()))
            .app_data(
                web::JsonConfig::default().error_handler(|err, _req| {
                    let body = errors::ErrorBody::new(
                        "INVALID_JSON",
                        format!("Could not parse request body: {}", err),
                    );
                    actix_web::error::InternalError::from_response(
                        err, HttpResponse::BadRequest().json(body),
                    ).into()
                }),
            )
            // ── CORS CONFIGURATION ──
            .wrap(
                Cors::default()
                    .allowed_origin("http://localhost:4200")
                    .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"])
                    .allowed_headers(vec![
                        actix_web::http::header::AUTHORIZATION,
                        actix_web::http::header::ACCEPT,
                        actix_web::http::header::CONTENT_TYPE,
                    ])
                    .supports_credentials()
                    .max_age(3600)
            )
            .wrap(Logger::default())          // ✅ Fix 1: use Logger directly, not middleware::Logger
            .service(health_check)
            .service(demo_serialize)
            .service(demo_formats)
            .service(demo_deserialize)        // ✅ Fix 2: use .service() instead of .route().to()
            .service(demo_validation)         // ✅ Fix 3: use .service() instead of .route().to()
            .service(
                web::scope("/api")
                    .route("/students", web::get().to(handlers::get_all_students))
                    .route("/students", web::post().to(handlers::create_student))
                    .route("/students/{id}", web::get().to(handlers::get_student_by_id))
                    .route("/students/{id}", web::put().to(handlers::update_student))
                    .route("/students/{id}", web::delete().to(handlers::delete_student))
                    .route("/students/{id}/grades", web::get().to(handlers::get_student_grades))
                    .route("/students/{id}/grades", web::post().to(handlers::add_student_grade)),
            )
    })
    .bind(&bind_address)?
    .run()
    .await
}