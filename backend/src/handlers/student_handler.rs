// src/handlers/student_handler.rs
// ============================================================
// STUDENT HANDLERS — Assignment 3.27
// All handlers now return Result<HttpResponse, ApiError> instead
// of impl Responder, giving us:
//   • Proper 404 / 400 / 409 / 500 status codes
//   • Structured JSON error bodies the Angular frontend can parse
//   • Clean propagation with the ? operator via From<sqlx::Error>
// ============================================================

use actix_web::{web, HttpResponse};
use anyhow::Context;          // adds .context() on Results
use sqlx::{PgPool, Row};

use crate::errors::ApiError;  // our custom error enum
use crate::models::*;

// ─────────────────────────────────────────────────────────────
// Helper type alias — keeps signatures concise
// ─────────────────────────────────────────────────────────────
type HandlerResult = Result<HttpResponse, ApiError>;

// ============================================================
// VALIDATION HELPERS  (use anyhow internally, return ApiError)
// ============================================================

/// Validate fields in a CreateStudentRequest.
/// Returns Err(ApiError::InvalidInput) with a descriptive message.
fn validate_create_request(req: &CreateStudentRequest) -> Result<(), ApiError> {
    if req.name.trim().is_empty() {
        return Err(ApiError::InvalidInput("'name' must not be empty.".to_string()));
    }
    if req.name.trim().len() < 2 {
        return Err(ApiError::InvalidInput(
            "'name' must be at least 2 characters.".to_string(),
        ));
    }
    if req.email.trim().is_empty() {
        return Err(ApiError::InvalidInput("'email' must not be empty.".to_string()));
    }
    if !req.email.contains('@') {
        return Err(ApiError::InvalidInput(
            "'email' must be a valid email address.".to_string(),
        ));
    }
    Ok(())
}

/// Validate fields in an UpdateStudentRequest.
fn validate_update_request(req: &UpdateStudentRequest) -> Result<(), ApiError> {
    // At least one field is required
    if req.name.is_none() && req.email.is_none() && req.status.is_none() {
        return Err(ApiError::InvalidInput(
            "At least one field (name, email, status) must be provided.".to_string(),
        ));
    }
    if let Some(ref name) = req.name {
        if name.trim().is_empty() {
            return Err(ApiError::InvalidInput(
                "'name' must not be empty if provided.".to_string(),
            ));
        }
    }
    if let Some(ref email) = req.email {
        if !email.contains('@') {
            return Err(ApiError::InvalidInput(
                "'email' must be a valid email address if provided.".to_string(),
            ));
        }
    }
    Ok(())
}

// ============================================================
// GET ALL STUDENTS
// ============================================================

pub async fn get_all_students(pool: web::Data<PgPool>) -> HandlerResult {
    // anyhow::Context gives us a readable error message if the query fails
    let students = sqlx::query_as::<_, Student>(
        "SELECT id, name, email, enrollment_date,
                status, gpa::float4, performance_level
         FROM students
         ORDER BY id",
    )
    .fetch_all(pool.get_ref())
    .await
    .context("Failed to fetch students from database")
    .map_err(ApiError::from)?;  // anyhow::Error → ApiError::InternalError

    let response = StudentListResponse {
        total: students.len(),
        students,
    };

    Ok(HttpResponse::Ok().json(response))
}

// ============================================================
// GET STUDENT BY ID
// ============================================================

pub async fn get_student_by_id(
    pool: web::Data<PgPool>,
    id: web::Path<i32>,
) -> HandlerResult {
    let student_id = *id;

    let student = sqlx::query_as::<_, Student>(
        "SELECT id, name, email, enrollment_date,
                status, gpa::float4, performance_level
         FROM students
         WHERE id = $1",
    )
    .bind(student_id)
    .fetch_one(pool.get_ref())
    .await
    .map_err(|e| {
        // sqlx::Error::RowNotFound  → ApiError::NotFound (via our From impl)
        // everything else           → ApiError::InternalError
        let api_err = ApiError::from(e);
        // Customize the NotFound message with the actual id
        if let ApiError::NotFound(_) = api_err {
            ApiError::NotFound(format!("Student with id {} does not exist.", student_id))
        } else {
            api_err
        }
    })?;

    Ok(HttpResponse::Ok().json(student))
}

// ============================================================
// CREATE STUDENT
// ============================================================

pub async fn create_student(
    pool: web::Data<PgPool>,
    req: web::Json<CreateStudentRequest>,
) -> HandlerResult {
    // 1. Validate first — fail fast with a 400 before touching the DB
    validate_create_request(&req)?;

    // 2. Insert and return the new id
    let record = sqlx::query(
        "INSERT INTO students (name, email, enrollment_date, status, gpa, performance_level)
         VALUES ($1, $2, $3, 'active', 0.0, 'average')
         RETURNING id",
    )
    .bind(req.name.trim())
    .bind(req.email.trim().to_lowercase())
    .bind(&req.enrollment_date)
    .fetch_one(pool.get_ref())
    .await
    .map_err(ApiError::from)?;  // handles duplicate-email → 409 automatically

    let new_id: i32 = record
        .try_get("id")
        .context("Returned row did not contain 'id'")
        .map_err(ApiError::from)?;

    let response = StudentResponse {
        id: new_id,
        name: req.name.trim().to_string(),
        email: req.email.trim().to_lowercase(),
        status: EnrollmentStatus::Active,
        message: "Student created successfully.".to_string(),
    };

    Ok(HttpResponse::Created().json(response))
}

// ============================================================
// UPDATE STUDENT
// ============================================================

pub async fn update_student(
    pool: web::Data<PgPool>,
    id: web::Path<i32>,
    req: web::Json<UpdateStudentRequest>,
) -> HandlerResult {
    let student_id = *id;

    // 1. Validate input
    validate_update_request(&req)?;

    // 2. Build dynamic UPDATE with COALESCE so unset fields keep their value
    let empty = String::new();
    let name  = req.name.as_ref().unwrap_or(&empty);
    let email = req.email.as_ref().unwrap_or(&empty);

    sqlx::query(
        "UPDATE students
         SET name  = COALESCE(NULLIF($1, ''), name),
             email = COALESCE(NULLIF($2, ''), email)
         WHERE id = $3
         RETURNING id",
    )
    .bind(name)
    .bind(email)
    .bind(student_id)
    .fetch_one(pool.get_ref())
    .await
    .map_err(|e| {
        let api_err = ApiError::from(e);
        if let ApiError::NotFound(_) = api_err {
            ApiError::NotFound(format!("Student with id {} does not exist.", student_id))
        } else {
            api_err
        }
    })?;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "success": true,
        "message": "Student updated successfully.",
        "id": student_id
    })))
}

// ============================================================
// DELETE STUDENT
// ============================================================

pub async fn delete_student(
    pool: web::Data<PgPool>,
    id: web::Path<i32>,
) -> HandlerResult {
    let student_id = *id;

    let result = sqlx::query("DELETE FROM students WHERE id = $1")
        .bind(student_id)
        .execute(pool.get_ref())
        .await
        .context("Failed to execute DELETE query")
        .map_err(ApiError::from)?;

    // rows_affected() == 0 means the student never existed → 404
    if result.rows_affected() == 0 {
        return Err(ApiError::NotFound(format!(
            "Student with id {} does not exist.",
            student_id
        )));
    }

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "success": true,
        "message": "Student deleted successfully.",
        "id": student_id
    })))
}