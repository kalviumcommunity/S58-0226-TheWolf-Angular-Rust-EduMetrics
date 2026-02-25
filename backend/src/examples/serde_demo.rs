//backend/src/examples/serde_demo.rs
use serde::{Deserialize, Serialize};

// ============================================================
// SERIALIZATION EXAMPLES - Rust to JSON
// ============================================================

/// Simple serialization example
#[derive(Serialize)]
pub struct SimpleResponse {
    pub message: String,
    pub code: i32,
}

/// Nested serialization
#[derive(Serialize)]
pub struct UserProfile {
    pub id: i32,
    pub name: String,
    pub metadata: UserMetadata,
}

#[derive(Serialize)]
pub struct UserMetadata {
    pub join_date: String,
    pub is_active: bool,
}

// ============================================================
// DESERIALIZATION EXAMPLES - JSON to Rust
// ============================================================

/// Simple deserialization
#[derive(Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

/// Optional fields
#[derive(Deserialize)]
pub struct SearchRequest {
    pub query: String,
    pub limit: Option<i32>,  // Optional: can be missing in JSON
    pub offset: Option<i32>,
}

/// Nested deserialization
#[derive(Deserialize)]
pub struct CreateProfileRequest {
    pub name: String,
    pub email: String,
    pub preferences: UserPreferences,
}

#[derive(Deserialize)]
pub struct UserPreferences {
    pub theme: String,
    pub notifications: bool,
}

// ============================================================
// BOTH DIRECTIONS - Serialize and Deserialize
// ============================================================

#[derive(Serialize, Deserialize, Clone)]
pub struct Student {
    pub id: i32,
    pub name: String,
    pub email: String,
    pub gpa: f32,
}

// ============================================================
// CUSTOM FIELD NAMES - Rename JSON fields
// ============================================================

#[derive(Serialize, Deserialize)]
pub struct ApiUser {
    #[serde(rename = "userId")]
    pub user_id: i32,
    
    #[serde(rename = "firstName")]
    pub first_name: String,
    
    #[serde(rename = "lastName")]
    pub last_name: String,
}

// ============================================================
// ENUMS - Serialize as strings
// ============================================================

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Status {
    Active,
    Inactive,
    Pending,
}

// ============================================================
// SKIPPING FIELDS
// ============================================================

#[derive(Serialize)]
pub struct SecureUser {
    pub id: i32,
    pub username: String,
    
    #[serde(skip)]  // Never include in JSON
    pub password_hash: String,
}

// ============================================================
// EXAMPLE USAGE FUNCTIONS
// ============================================================

pub fn serialization_example() -> String {
    let response = SimpleResponse {
        message: "Success".to_string(),
        code: 200,
    };
    
    // Convert to JSON string
    serde_json::to_string(&response).unwrap()
}

pub fn deserialization_example(json: &str) -> Result<LoginRequest, serde_json::Error> {
    // Parse JSON string into struct
    serde_json::from_str(json)
}

pub fn pretty_print_example() -> String {
    let user = Student {
        id: 1,
        name: "Alice".to_string(),
        email: "alice@example.com".to_string(),
        gpa: 3.8,
    };
    
    // Pretty-printed JSON
    serde_json::to_string_pretty(&user).unwrap()
}