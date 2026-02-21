// src/errors.rs
// ============================================================
// CUSTOM ERROR TYPES - Assignment 3.27
// ============================================================
// This module defines all API error types and maps them to
// proper HTTP responses with structured JSON bodies.

use actix_web::HttpResponse;
use serde::Serialize;
use std::fmt;

// ============================================================
// ERROR RESPONSE BODY
// ============================================================

/// The JSON shape returned to the frontend for every error
#[derive(Debug, Serialize)]
pub struct ErrorBody {
    pub success: bool,
    pub error_code: String,
    pub message: String,
}

impl ErrorBody {
    pub fn new(error_code: &str, message: impl Into<String>) -> Self {
        ErrorBody {
            success: false,
            error_code: error_code.to_string(),
            message: message.into(),
        }
    }
}

// ============================================================
// API ERROR ENUM
// ============================================================

/// All possible errors that a handler can return to the frontend.
/// Each variant maps to a specific HTTP status code and error code string.
#[derive(Debug, Clone)]
pub enum ApiError {
    /// 404 – row not found in the database
    NotFound(String),

    /// 400 – the request body / parameters failed validation
    InvalidInput(String),

    /// 409 – unique constraint violation (e.g. duplicate email)
    Conflict(String),

    /// 500 – unexpected database or internal failure
    InternalError(String),
}

impl fmt::Display for ApiError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ApiError::NotFound(msg)      => write!(f, "Not found: {}", msg),
            ApiError::InvalidInput(msg)  => write!(f, "Invalid input: {}", msg),
            ApiError::Conflict(msg)      => write!(f, "Conflict: {}", msg),
            ApiError::InternalError(msg) => write!(f, "Internal error: {}", msg),
        }
    }
}

// ============================================================
// CONVERT ApiError → HttpResponse
// ============================================================

impl ApiError {
    /// Turn an ApiError into the appropriate Actix HttpResponse.
    /// Call this at the end of every handler: `err.into_response()`
    pub fn into_response(self) -> HttpResponse {
        match self {
            ApiError::NotFound(msg) => HttpResponse::NotFound().json(ErrorBody::new(
                "NOT_FOUND",
                msg,
            )),

            ApiError::InvalidInput(msg) => HttpResponse::BadRequest().json(ErrorBody::new(
                "INVALID_INPUT",
                msg,
            )),

            ApiError::Conflict(msg) => HttpResponse::Conflict().json(ErrorBody::new(
                "CONFLICT",
                msg,
            )),

            ApiError::InternalError(msg) => {
                // Log the real error server-side; never leak internals to the client
                eprintln!("[ERROR] Internal server error: {}", msg);
                HttpResponse::InternalServerError().json(ErrorBody::new(
                    "INTERNAL_ERROR",
                    "An unexpected error occurred. Please try again later.",
                ))
            }
        }
    }
}

// ============================================================
// CONVERT sqlx::Error → ApiError
// ============================================================

impl From<sqlx::Error> for ApiError {
    fn from(e: sqlx::Error) -> Self {
        match e {
            // Row not found → 404
            sqlx::Error::RowNotFound => {
                ApiError::NotFound("The requested resource does not exist.".to_string())
            }

            // Unique constraint violation → 409
            sqlx::Error::Database(ref db_err)
                if db_err
                    .constraint()
                    .map(|c| c.contains("email"))
                    .unwrap_or(false) =>
            {
                ApiError::Conflict("A student with this email already exists.".to_string())
            }

            // Everything else → 500
            other => ApiError::InternalError(other.to_string()),
        }
    }
}

// ============================================================
// CONVERT anyhow::Error → ApiError
// ============================================================
// anyhow is used inside service/helper functions.
// When those errors bubble up to a handler we convert them here.

impl From<anyhow::Error> for ApiError {
    fn from(e: anyhow::Error) -> Self {
        ApiError::InternalError(e.to_string())
    }
}

// ============================================================
// IMPLEMENT ACTIX ResponseError TRAIT
// ============================================================

impl actix_web::error::ResponseError for ApiError {
    fn error_response(&self) -> HttpResponse {
        self.clone().into_response()
    }

    fn status_code(&self) -> actix_web::http::StatusCode {
        use actix_web::http::StatusCode;
        match self {
            ApiError::NotFound(_) => StatusCode::NOT_FOUND,
            ApiError::InvalidInput(_) => StatusCode::BAD_REQUEST,
            ApiError::Conflict(_) => StatusCode::CONFLICT,
            ApiError::InternalError(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}