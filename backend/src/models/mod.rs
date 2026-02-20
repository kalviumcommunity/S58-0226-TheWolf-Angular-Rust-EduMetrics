//src/models/mod.rs
// ============================================================
// MODELS MODULE - Export all data types
// ============================================================

pub mod student;
pub mod score;
pub mod attendance;
pub mod response;

// Re-export commonly used types
pub use student::{
    Student, CreateStudentRequest, UpdateStudentRequest, 
    StudentResponse, StudentListResponse, StudentAnalytics,
    EnrollmentStatus, PerformanceLevel, AttendanceStatus,
};

pub use score::{
    Score, CreateScoreRequest, ScoreAnalytics,
    Subject, Grade,
};

pub use attendance::{
    Attendance, MarkAttendanceRequest, AttendanceAnalytics,
};

pub use response::{
    ApiResponse, SuccessResponse, ErrorResponse,
    ValidationError, ValidationErrorResponse,
};