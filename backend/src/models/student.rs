use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::NaiveDate;

// ============================================================
// ENUMS - Prevent Invalid States
// ============================================================

/// Student enrollment status
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum EnrollmentStatus {
    Active,
    Suspended,
    Graduated,
    Withdrawn,
}

/// Academic performance level
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum PerformanceLevel {
    Excellent,
    Good,
    Average,
    NeedsImprovement,
    AtRisk,
}

/// Attendance status for a session
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum AttendanceStatus {
    Present,
    Absent,
    Late,
    Excused,
}

// ============================================================
// STUDENT ENTITY - Main Domain Model (DATABASE VERSION)
// ============================================================

/// Complete student record from database
/// Note: Enums are stored as strings in PostgreSQL
#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
pub struct Student {
    pub id: i32,
    pub name: String,
    pub email: String,
    pub enrollment_date: NaiveDate,
    pub status: String,
    pub gpa: f32,
    pub performance_level: String,
}

// Helper methods to convert between database strings and enums
impl Student {
    /// Convert status string to enum
    pub fn get_status_enum(&self) -> EnrollmentStatus {
        match self.status.as_str() {
            "active" => EnrollmentStatus::Active,
            "suspended" => EnrollmentStatus::Suspended,
            "graduated" => EnrollmentStatus::Graduated,
            "withdrawn" => EnrollmentStatus::Withdrawn,
            _ => EnrollmentStatus::Active, // Default
        }
    }

    /// Convert performance_level string to enum
    pub fn get_performance_enum(&self) -> PerformanceLevel {
        match self.performance_level.as_str() {
            "excellent" => PerformanceLevel::Excellent,
            "good" => PerformanceLevel::Good,
            "average" => PerformanceLevel::Average,
            "needsimprovement" => PerformanceLevel::NeedsImprovement,
            "atrisk" => PerformanceLevel::AtRisk,
            _ => PerformanceLevel::Average, // Default
        }
    }
}

// ============================================================
// REQUEST MODELS - API Input
// ============================================================

/// Request to create a new student
#[derive(Debug, Deserialize)]
pub struct CreateStudentRequest {
    pub name: String,
    pub email: String,
    pub enrollment_date: NaiveDate,
}

/// Request to update student information
#[derive(Debug, Deserialize)]
pub struct UpdateStudentRequest {
    pub name: Option<String>,
    pub email: Option<String>,
    pub status: Option<EnrollmentStatus>,
}

// ============================================================
// RESPONSE MODELS - API Output
// ============================================================

/// Successful student creation response
#[derive(Debug, Serialize)]
pub struct StudentResponse {
    pub id: i32,
    pub name: String,
    pub email: String,
    pub status: EnrollmentStatus,
    pub message: String,
}

/// Student list response
#[derive(Debug, Serialize)]
pub struct StudentListResponse {
    pub students: Vec<Student>,
    pub total: usize,
}

/// Student analytics summary
#[derive(Debug, Serialize)]
pub struct StudentAnalytics {
    pub student_id: i32,
    pub student_name: String,
    pub average_score: f32,
    pub attendance_rate: f32,
    pub performance_level: PerformanceLevel,
    pub risk_indicators: Vec<String>,
}