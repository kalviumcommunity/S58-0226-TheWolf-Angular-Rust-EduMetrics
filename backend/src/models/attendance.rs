//backend/src/models/attendance.rs
use serde::{Deserialize, Serialize};
use super::student::AttendanceStatus;

// ============================================================
// ATTENDANCE RECORD
// ============================================================

/// Individual attendance record
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Attendance {
    pub id: i32,
    pub student_id: i32,
    pub date: String,
    pub status: AttendanceStatus,
    pub class_name: String,
}

/// Request to mark attendance
#[derive(Debug, Deserialize)]
pub struct MarkAttendanceRequest {
    pub student_id: i32,
    pub date: String,
    pub status: AttendanceStatus,
    pub class_name: String,
}

/// Attendance analytics
#[derive(Debug, Serialize)]
pub struct AttendanceAnalytics {
    pub student_id: i32,
    pub total_classes: i32,
    pub present: i32,
    pub absent: i32,
    pub late: i32,
    pub attendance_rate: f32,
}