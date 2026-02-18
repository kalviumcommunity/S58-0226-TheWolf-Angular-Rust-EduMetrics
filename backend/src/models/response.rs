use serde::Serialize;

// ============================================================
// GENERIC API RESPONSES
// ============================================================

/// Standard success response
#[derive(Debug, Serialize)]
pub struct SuccessResponse<T> {
    pub success: bool,
    pub data: T,
    pub message: String,
}

/// Standard error response
#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    pub success: bool,
    pub error: String,
    pub error_code: String,
}

/// Validation error details
#[derive(Debug, Serialize)]
pub struct ValidationError {
    pub field: String,
    pub message: String,
}

/// Validation error response
#[derive(Debug, Serialize)]
pub struct ValidationErrorResponse {
    pub success: bool,
    pub errors: Vec<ValidationError>,
}

// ============================================================
// API RESPONSE ENUM - Type-Safe Response
// ============================================================

#[derive(Debug, Serialize)]
#[serde(untagged)]
pub enum ApiResponse<T> {
    Success(SuccessResponse<T>),
    Error(ErrorResponse),
    ValidationError(ValidationErrorResponse),
}

impl<T> ApiResponse<T> {
    pub fn success(data: T, message: String) -> Self {
        ApiResponse::Success(SuccessResponse {
            success: true,
            data,
            message,
        })
    }

    pub fn error(error: String, error_code: String) -> Self {
        ApiResponse::Error(ErrorResponse {
            success: false,
            error,
            error_code,
        })
    }
}