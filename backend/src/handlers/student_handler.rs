use actix_web::{web, HttpResponse, Responder};
use sqlx::{PgPool, Row};  // ← Add Row here
use crate::models::*;

// ============================================================
// GET ALL STUDENTS
// ============================================================
pub async fn get_all_students(pool: web::Data<PgPool>) -> impl Responder {
    let result = sqlx::query_as::<_, Student>(
        "SELECT id, name, email, enrollment_date, 
                status, gpa::float4, performance_level
         FROM students
         ORDER BY id"
    )
    .fetch_all(pool.get_ref())
    .await;

    match result {
        Ok(students) => {
            let response = StudentListResponse {
                total: students.len(),
                students,
            };
            HttpResponse::Ok().json(response)
        }
        Err(e) => {
            eprintln!("Database error: {:?}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch students"
            }))
        }
    }
}

// ============================================================
// GET STUDENT BY ID
// ============================================================
pub async fn get_student_by_id(
    pool: web::Data<PgPool>,
    id: web::Path<i32>,
) -> impl Responder {
    let result = sqlx::query_as::<_, Student>(
        "SELECT id, name, email, enrollment_date,
                status, gpa::float4, performance_level
         FROM students
         WHERE id = $1"
    )
    .bind(*id)
    .fetch_one(pool.get_ref())
    .await;

    match result {
        Ok(student) => HttpResponse::Ok().json(student),
        Err(sqlx::Error::RowNotFound) => {
            HttpResponse::NotFound().json(serde_json::json!({
                "error": "Student not found"
            }))
        }
        Err(e) => {
            eprintln!("Database error: {:?}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database error"
            }))
        }
    }
}

// ============================================================
// CREATE STUDENT
// ============================================================
pub async fn create_student(
    pool: web::Data<PgPool>,
    req: web::Json<CreateStudentRequest>,
) -> impl Responder {
    let result = sqlx::query(
        "INSERT INTO students (name, email, enrollment_date, status, gpa, performance_level)
         VALUES ($1, $2, $3, 'active', 0.0, 'average')
         RETURNING id"
    )
    .bind(&req.name)
    .bind(&req.email)
    .bind(&req.enrollment_date)
    .fetch_one(pool.get_ref())
    .await;

    match result {
        Ok(record) => {
            let id: i32 = record.try_get("id").unwrap_or(0);
            let response = StudentResponse {
                id,
                name: req.name.clone(),
                email: req.email.clone(),
                status: EnrollmentStatus::Active,
                message: "Student created successfully".to_string(),
            };
            HttpResponse::Created().json(response)
        }
        Err(e) => {
            eprintln!("Database error: {:?}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to create student"
            }))
        }
    }
}

// ============================================================
// DELETE STUDENT
// ============================================================
pub async fn delete_student(
    pool: web::Data<PgPool>,
    id: web::Path<i32>,
) -> impl Responder {
    let result = sqlx::query("DELETE FROM students WHERE id = $1")
        .bind(*id)
        .execute(pool.get_ref())
        .await;

    match result {
        Ok(result) => {
            if result.rows_affected() > 0 {
                HttpResponse::Ok().json(serde_json::json!({
                    "message": "Student deleted successfully"
                }))
            } else {
                HttpResponse::NotFound().json(serde_json::json!({
                    "error": "Student not found"
                }))
            }
        }
        Err(e) => {
            eprintln!("Database error: {:?}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to delete student"
            }))
        }
    }
}