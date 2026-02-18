use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use serde::Serialize;
use std::env;

mod models;
use models::*;

// ============================================================
// HEALTH CHECK ENDPOINT
// ============================================================
#[derive(Serialize)]
struct HealthResponse {
    status: String,
    message: String,
    service: String,
    version: String,
}

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
// DEMO ENDPOINTS USING MODELS
// ============================================================

/// Get all students (mock data)
#[get("/api/students")]
async fn get_students() -> impl Responder {
    let students = vec![
        Student {
            id: 1,
            name: "Alice Johnson".to_string(),
            email: "alice@example.com".to_string(),
            enrollment_date: "2024-01-15".to_string(),
            status: EnrollmentStatus::Active,
            gpa: 3.8,
            performance_level: PerformanceLevel::Excellent,
        },
        Student {
            id: 2,
            name: "Bob Smith".to_string(),
            email: "bob@example.com".to_string(),
            enrollment_date: "2024-01-20".to_string(),
            status: EnrollmentStatus::Active,
            gpa: 3.2,
            performance_level: PerformanceLevel::Good,
        },
    ];

    let response = StudentListResponse {
        total: students.len(),
        students,
    };

    HttpResponse::Ok().json(response)
}

/// Create a new student (demonstrates request validation)
#[post("/api/students")]
async fn create_student(req: web::Json<CreateStudentRequest>) -> impl Responder {
    // In real app, save to database here
    
    let response = StudentResponse {
        id: 1,
        name: req.name.clone(),
        email: req.email.clone(),
        status: EnrollmentStatus::Active,
        message: "Student created successfully".to_string(),
    };

    HttpResponse::Created().json(response)
}

/// Get student analytics by ID
#[get("/api/students/{id}/analytics")]
async fn get_student_analytics(id: web::Path<i32>) -> impl Responder {
    let analytics = StudentAnalytics {
        student_id: *id,
        student_name: "Alice Johnson".to_string(),
        average_score: 88.5,
        attendance_rate: 95.0,
        performance_level: PerformanceLevel::Excellent,
        risk_indicators: vec![],
    };

    HttpResponse::Ok().json(analytics)
}

/// Demo of enum pattern matching
#[get("/api/demo/status/{status}")]
async fn demo_status_matching(status: web::Path<String>) -> impl Responder {
    let message = match status.as_str() {
        "active" => "Student is actively enrolled",
        "suspended" => "Student account is suspended",
        "graduated" => "Student has graduated",
        "withdrawn" => "Student has withdrawn",
        _ => "Unknown status",
    };

    HttpResponse::Ok().json(serde_json::json!({
        "status": status.as_str(),
        "message": message
    }))
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

    let startup_log = StartupLog {
        level: "INFO".to_string(),
        message: "EduMetrics Backend with Type-Safe Models".to_string(),
        environment: "development".to_string(),
        server_url: format!("http://{}:{}", host, port),
    };

    println!("{}", serde_json::to_string(&startup_log).unwrap());

    HttpServer::new(|| {
        App::new()
            .service(health_check)
            .service(get_students)
            .service(create_student)
            .service(get_student_analytics)
            .service(demo_status_matching)
    })
    .bind(&bind_address)?
    .run()
    .await
}