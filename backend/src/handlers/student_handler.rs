// src/handlers/student_handler.rs
// ============================================================
// STUDENT HANDLERS — Updated for Assignment 3.29
// Fix: search_pattern moved outside if-block to fix lifetime issue
// ============================================================

use actix_web::{web, HttpResponse};
use anyhow::Context;
use sqlx::{PgPool, Row};

use crate::errors::ApiError;
use crate::models::*;

type HandlerResult = Result<HttpResponse, ApiError>;

// ──────────────────────────────────────────────────────────
// VALIDATION HELPERS
// ──────────────────────────────────────────────────────────

fn validate_create_request(req: &CreateStudentRequest) -> Result<(), ApiError> {
    if req.name.trim().is_empty() {
        return Err(ApiError::InvalidInput("'name' must not be empty.".into()));
    }
    if req.name.trim().len() < 2 {
        return Err(ApiError::InvalidInput("'name' must be at least 2 characters.".into()));
    }
    if req.email.trim().is_empty() {
        return Err(ApiError::InvalidInput("'email' must not be empty.".into()));
    }
    if !req.email.contains('@') {
        return Err(ApiError::InvalidInput("'email' must be a valid email address.".into()));
    }
    Ok(())
}

fn validate_update_request(req: &UpdateStudentRequest) -> Result<(), ApiError> {
    if req.name.is_none()
        && req.email.is_none()
        && req.status.is_none()
        && req.phone.is_none()
        && req.address.is_none()
        && req.department.is_none()
    {
        return Err(ApiError::InvalidInput(
            "At least one field must be provided to update.".into(),
        ));
    }
    if let Some(ref email) = req.email {
        if !email.contains('@') {
            return Err(ApiError::InvalidInput("'email' must be a valid email.".into()));
        }
    }
    Ok(())
}

fn validate_grade_request(req: &CreateGradeRequest) -> Result<(), ApiError> {
    if req.semester.trim().is_empty() {
        return Err(ApiError::InvalidInput("'semester' must not be empty.".into()));
    }
    if req.semester_gpa < 0.0 || req.semester_gpa > 4.0 {
        return Err(ApiError::InvalidInput(
            "'semester_gpa' must be between 0.0 and 4.0.".into(),
        ));
    }
    if req.credits < 0 {
        return Err(ApiError::InvalidInput("'credits' must be a positive number.".into()));
    }
    Ok(())
}

// ============================================================
// GET ALL STUDENTS WITH PAGINATION & FILTERING
// ============================================================
pub async fn get_all_students(
    pool: web::Data<PgPool>,
    query: web::Query<StudentQuery>,
) -> HandlerResult {
    
    let limit = query.get_limit();
    let offset = query.get_offset();
    let sort_by = query.get_sort_by();
    let order = query.get_order();
    
    // Build WHERE clause dynamically
    let mut where_clauses = Vec::new();
    let mut bind_count = 1;
    
    // Filter by status
    let status_filter = query.status.is_some();
    if status_filter {
        let clause = format!("status = ${}", bind_count);
        bind_count += 1;
        where_clauses.push(clause);
    }
    
    // Filter by department
    let department_filter = query.department.is_some();
    if department_filter {
        let clause = format!("department = ${}", bind_count);
        bind_count += 1;
        where_clauses.push(clause);
    }
    
    // Filter by minimum GPA
    let gpa_filter = query.min_gpa.is_some();
    if gpa_filter {
        let clause = format!("gpa >= ${}", bind_count);
        bind_count += 1;
        where_clauses.push(clause);
    }
    
    // Search in name or email - FIX FOR LIFETIME ISSUE
    let search_pattern = if let Some(ref search_term) = query.search {
        Some(format!("%{}%", search_term))
    } else {
        None
    };
    
    let search_filter = search_pattern.is_some();
    if search_filter {
        let clause = format!("(name ILIKE ${} OR email ILIKE ${})", bind_count, bind_count);
        bind_count += 1;
        where_clauses.push(clause);
    }
    
    let where_sql = if where_clauses.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", where_clauses.join(" AND "))
    };
    
    // Count total matching records
    let count_sql = format!("SELECT COUNT(*) FROM students {}", where_sql);
    let mut count_query = sqlx::query_scalar::<_, i64>(&count_sql);
    
    // Bind parameters for count query
    if status_filter {
        count_query = count_query.bind(query.status.as_ref().unwrap());
    }
    if department_filter {
        count_query = count_query.bind(query.department.as_ref().unwrap());
    }
    if gpa_filter {
        count_query = count_query.bind(query.min_gpa.unwrap());
    }
    if search_filter {
        count_query = count_query.bind(search_pattern.as_ref().unwrap());
    }
    
    let total = count_query
        .fetch_one(pool.get_ref())
        .await
        .context("Failed to count students")
        .map_err(ApiError::from)?;
    
    // Fetch paginated data
    let data_sql = format!(
        "SELECT id, name, email, enrollment_date, status, gpa::float4, 
                performance_level, phone, address, department
         FROM students
         {}
         ORDER BY {} {}
         LIMIT ${} OFFSET ${}",
        where_sql,
        sort_by,
        order,
        bind_count,
        bind_count + 1
    );
    
    let mut data_query = sqlx::query_as::<_, Student>(&data_sql);
    
    // Bind parameters for data query
    if status_filter {
        data_query = data_query.bind(query.status.as_ref().unwrap());
    }
    if department_filter {
        data_query = data_query.bind(query.department.as_ref().unwrap());
    }
    if gpa_filter {
        data_query = data_query.bind(query.min_gpa.unwrap());
    }
    if search_filter {
        data_query = data_query.bind(search_pattern.as_ref().unwrap());
    }
    
    data_query = data_query.bind(limit).bind(offset);
    
    let students = data_query
        .fetch_all(pool.get_ref())
        .await
        .context("Failed to fetch students")
        .map_err(ApiError::from)?;
    
    let response = PaginatedResponse::new(
        query.get_page(),
        limit,
        total,
        students,
    );
    
    Ok(HttpResponse::Ok().json(response))
}

// ============================================================
// GET STUDENT BY ID
// ============================================================
pub async fn get_student_by_id(
    pool: web::Data<PgPool>,
    id: web::Path<i32>,
) -> HandlerResult {
    let sid = *id;

    let student = sqlx::query_as::<_, Student>(
        "SELECT id, name, email, enrollment_date,
                status, gpa::float4, performance_level,
                phone, address, department
         FROM students WHERE id = $1",
    )
    .bind(sid)
    .fetch_one(pool.get_ref())
    .await
    .map_err(|e| match ApiError::from(e) {
        ApiError::NotFound(_) => ApiError::NotFound(format!("Student {} not found.", sid)),
        other => other,
    })?;

    Ok(HttpResponse::Ok().json(student))
}

// ============================================================
// CREATE STUDENT — stores phone, address, department
// ============================================================
pub async fn create_student(
    pool: web::Data<PgPool>,
    req: web::Json<CreateStudentRequest>,
) -> HandlerResult {
    validate_create_request(&req)?;

    let record = sqlx::query(
        "INSERT INTO students
             (name, email, enrollment_date, status, gpa, performance_level,
              phone, address, department)
         VALUES ($1, $2, $3, 'active', 0.0, 'average', $4, $5, $6)
         RETURNING id",
    )
    .bind(req.name.trim())
    .bind(req.email.trim().to_lowercase())
    .bind(&req.enrollment_date)
    .bind(&req.phone)
    .bind(&req.address)
    .bind(req.department.as_deref().unwrap_or("General"))
    .fetch_one(pool.get_ref())
    .await
    .map_err(ApiError::from)?;

    let new_id: i32 = record
        .try_get("id")
        .context("Missing id in RETURNING clause")
        .map_err(ApiError::from)?;

    Ok(HttpResponse::Created().json(StudentResponse {
        id:      new_id,
        name:    req.name.trim().to_string(),
        email:   req.email.trim().to_lowercase(),
        status:  EnrollmentStatus::Active,
        message: "Student created successfully.".into(),
    }))
}

// ============================================================
// UPDATE STUDENT — accepts phone, address, department
// ============================================================
pub async fn update_student(
    pool: web::Data<PgPool>,
    id: web::Path<i32>,
    req: web::Json<UpdateStudentRequest>,
) -> HandlerResult {
    let sid = *id;
    validate_update_request(&req)?;

    let empty      = String::new();
    let name       = req.name.as_ref().unwrap_or(&empty);
    let email      = req.email.as_ref().unwrap_or(&empty);
    let phone      = req.phone.as_ref().unwrap_or(&empty);
    let address    = req.address.as_ref().unwrap_or(&empty);
    let department = req.department.as_ref().unwrap_or(&empty);

    sqlx::query(
        "UPDATE students SET
             name       = COALESCE(NULLIF($1, ''), name),
             email      = COALESCE(NULLIF($2, ''), email),
             phone      = COALESCE(NULLIF($3, ''), phone),
             address    = COALESCE(NULLIF($4, ''), address),
             department = COALESCE(NULLIF($5, ''), department)
         WHERE id = $6
         RETURNING id",
    )
    .bind(name)
    .bind(email)
    .bind(phone)
    .bind(address)
    .bind(department)
    .bind(sid)
    .fetch_one(pool.get_ref())
    .await
    .map_err(|e| match ApiError::from(e) {
        ApiError::NotFound(_) => ApiError::NotFound(format!("Student {} not found.", sid)),
        other => other,
    })?;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "success": true,
        "message": "Student updated successfully.",
        "id": sid
    })))
}

// ============================================================
// DELETE STUDENT
// ============================================================
pub async fn delete_student(
    pool: web::Data<PgPool>,
    id: web::Path<i32>,
) -> HandlerResult {
    let sid = *id;

    let result = sqlx::query("DELETE FROM students WHERE id = $1")
        .bind(sid)
        .execute(pool.get_ref())
        .await
        .context("DELETE query failed")
        .map_err(ApiError::from)?;

    if result.rows_affected() == 0 {
        return Err(ApiError::NotFound(format!("Student {} not found.", sid)));
    }

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "success": true,
        "message": "Student deleted successfully.",
        "id": sid
    })))
}

// ============================================================
// GET GRADES FOR A STUDENT
// ============================================================
pub async fn get_student_grades(
    pool: web::Data<PgPool>,
    id: web::Path<i32>,
) -> HandlerResult {
    let sid = *id;

    let exists: bool = sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM students WHERE id = $1)")
        .bind(sid)
        .fetch_one(pool.get_ref())
        .await
        .context("Failed to verify student")
        .map_err(ApiError::from)?;

    if !exists {
        return Err(ApiError::NotFound(format!("Student {} not found.", sid)));
    }

    let grades = sqlx::query_as::<_, Grade>(
        "SELECT id, student_id, semester,
                semester_gpa::float4, credits, standing
         FROM grades
         WHERE student_id = $1
         ORDER BY semester",
    )
    .bind(sid)
    .fetch_all(pool.get_ref())
    .await
    .context("Failed to fetch grades")
    .map_err(ApiError::from)?;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "student_id": sid,
        "total": grades.len(),
        "grades": grades
    })))
}

// ============================================================
// ADD / UPDATE GRADE FOR A STUDENT
// ============================================================
pub async fn add_student_grade(
    pool: web::Data<PgPool>,
    id: web::Path<i32>,
    req: web::Json<CreateGradeRequest>,
) -> HandlerResult {
    let sid = *id;
    validate_grade_request(&req)?;

    let exists: bool = sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM students WHERE id = $1)")
        .bind(sid)
        .fetch_one(pool.get_ref())
        .await
        .context("Failed to verify student")
        .map_err(ApiError::from)?;

    if !exists {
        return Err(ApiError::NotFound(format!("Student {} not found.", sid)));
    }

    let standing = req.standing.as_deref().unwrap_or("satisfactory");

    let record = sqlx::query(
        "INSERT INTO grades (student_id, semester, semester_gpa, credits, standing)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (student_id, semester) DO UPDATE
             SET semester_gpa = EXCLUDED.semester_gpa,
                 credits      = EXCLUDED.credits,
                 standing     = EXCLUDED.standing
         RETURNING id",
    )
    .bind(sid)
    .bind(req.semester.trim())
    .bind(req.semester_gpa)
    .bind(req.credits)
    .bind(standing)
    .fetch_one(pool.get_ref())
    .await
    .map_err(ApiError::from)?;

    let new_id: i32 = record.try_get("id").unwrap_or(0);

    Ok(HttpResponse::Created().json(serde_json::json!({
        "success": true,
        "message": "Grade recorded successfully.",
        "grade_id": new_id,
        "student_id": sid,
        "semester": req.semester.trim()
    })))
}