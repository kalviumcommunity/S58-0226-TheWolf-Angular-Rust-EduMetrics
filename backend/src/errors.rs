// src/errors.rs
// ============================================================
// Fix: implement actix_web::ResponseError for ApiError
// This is required for Result<HttpResponse, ApiError> to work
// as a Responder in Actix-Web route handlers.
// ============================================================

use actix_web::{HttpResponse, ResponseError};
use serde::Serialize;
use std::fmt;

#[derive(Debug, Serialize)]
pub struct ErrorBody {
    pub success:    bool,
    pub error_code: String,
    pub message:    String,
}

impl ErrorBody {
    pub fn new(error_code: &str, message: impl Into<String>) -> Self {
        ErrorBody { success: false, error_code: error_code.to_string(), message: message.into() }
    }
}

#[derive(Debug)]
pub enum ApiError {
    NotFound(String),
    InvalidInput(String),
    Conflict(String),
    Unauthorized(String),
    Forbidden(String),
    InternalError(String),
}

// ── Required by Actix: Display must be implemented ───────────
impl fmt::Display for ApiError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ApiError::NotFound(m)      => write!(f, "Not found: {}", m),
            ApiError::InvalidInput(m)  => write!(f, "Invalid input: {}", m),
            ApiError::Conflict(m)      => write!(f, "Conflict: {}", m),
            ApiError::Unauthorized(m)  => write!(f, "Unauthorized: {}", m),
            ApiError::Forbidden(m)     => write!(f, "Forbidden: {}", m),
            ApiError::InternalError(m) => write!(f, "Internal error: {}", m),
        }
    }
}

// ── THIS is what was missing — implement ResponseError ────────
// Actix needs this to allow Result<HttpResponse, ApiError>
// as a valid return type from route handlers.
impl ResponseError for ApiError {
    fn error_response(&self) -> HttpResponse {
        match self {
            ApiError::NotFound(msg) =>
                HttpResponse::NotFound().json(ErrorBody::new("NOT_FOUND", msg)),
            ApiError::InvalidInput(msg) =>
                HttpResponse::BadRequest().json(ErrorBody::new("INVALID_INPUT", msg)),
            ApiError::Conflict(msg) =>
                HttpResponse::Conflict().json(ErrorBody::new("CONFLICT", msg)),
            ApiError::Unauthorized(msg) =>
                HttpResponse::Unauthorized().json(ErrorBody::new("UNAUTHORIZED", msg)),
            ApiError::Forbidden(msg) =>
                HttpResponse::Forbidden().json(ErrorBody::new("FORBIDDEN", msg)),
            ApiError::InternalError(msg) => {
                eprintln!("[ERROR] {}", msg);
                HttpResponse::InternalServerError()
                    .json(ErrorBody::new("INTERNAL_ERROR", "An unexpected error occurred."))
            }
        }
    }
}

impl From<sqlx::Error> for ApiError {
    fn from(e: sqlx::Error) -> Self {
        match e {
            sqlx::Error::RowNotFound => ApiError::NotFound(
                "The requested resource does not exist.".to_string(),
            ),
            sqlx::Error::Database(ref db_err)
                if db_err.constraint().map(|c| c.contains("email")).unwrap_or(false) =>
            {
                ApiError::Conflict("A student with this email already exists.".to_string())
            }
            other => ApiError::InternalError(other.to_string()),
        }
    }
}

impl From<anyhow::Error> for ApiError {
    fn from(e: anyhow::Error) -> Self {
        ApiError::InternalError(e.to_string())
    }
}