// src/models/student.rs
// ============================================================
// STUDENT MODEL — Updated for Assignment 3.29
// Reflects schema changes from:
//   • Migration 002: phone, address, department columns on students
//   • Migration 003: new Grade struct for the grades table
// ============================================================

use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::NaiveDate;

// ──────────────────────────────────────────────────────────
// ENUMS
// ──────────────────────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum EnrollmentStatus { Active, Suspended, Graduated, Withdrawn }

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum PerformanceLevel { Excellent, Good, Average, NeedsImprovement, AtRisk }

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum AttendanceStatus { Present, Absent, Late, Excused }

// ──────────────────────────────────────────────────────────
// STUDENT — includes columns added by Migration 002
// ──────────────────────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
pub struct Student {
    pub id:                i32,
    pub name:              String,
    pub email:             String,
    pub enrollment_date:   NaiveDate,
    pub status:            String,
    pub gpa:               f32,
    pub performance_level: String,
    // Migration 002 columns (Option so old rows still deserialise)
    pub phone:      Option<String>,
    pub address:    Option<String>,
    pub department: Option<String>,
}

// ──────────────────────────────────────────────────────────
// GRADE — new struct for the grades table (Migration 003)
// ──────────────────────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
pub struct Grade {
    pub id:           i32,
    pub student_id:   i32,
    pub semester:     String,
    pub semester_gpa: f32,
    pub credits:      i32,
    pub standing:     String,
}

// ──────────────────────────────────────────────────────────
// REQUEST MODELS
// ──────────────────────────────────────────────────────────
#[derive(Debug, Deserialize)]
pub struct CreateStudentRequest {
    pub name:            String,
    pub email:           String,
    pub enrollment_date: NaiveDate,
    // Optional contact fields from Migration 002
    pub phone:      Option<String>,
    pub address:    Option<String>,
    pub department: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateStudentRequest {
    pub name:   Option<String>,
    pub email:  Option<String>,
    pub status: Option<EnrollmentStatus>,
    // Optional contact fields from Migration 002
    pub phone:      Option<String>,
    pub address:    Option<String>,
    pub department: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateGradeRequest {
    pub semester:     String,
    pub semester_gpa: f32,
    pub credits:      i32,
    pub standing:     Option<String>,
}

// ──────────────────────────────────────────────────────────
// RESPONSE MODELS
// ──────────────────────────────────────────────────────────
#[derive(Debug, Serialize)]
pub struct StudentResponse {
    pub id:      i32,
    pub name:    String,
    pub email:   String,
    pub status:  EnrollmentStatus,
    pub message: String,
}

#[derive(Debug, Serialize)]
pub struct StudentListResponse {
    pub students: Vec<Student>,
    pub total:    usize,
}

#[derive(Debug, Serialize)]
pub struct StudentAnalytics {
    pub student_id:        i32,
    pub student_name:      String,
    pub average_score:     f32,
    pub attendance_rate:   f32,
    pub performance_level: PerformanceLevel,
    pub risk_indicators:   Vec<String>,
}