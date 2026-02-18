use serde::{Deserialize, Serialize};

// ============================================================
// ENUMS
// ============================================================

/// Subject categories
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Subject {
    Mathematics,
    Science,
    English,
    History,
    Programming,
    DataStructures,
}

/// Grade letter
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum Grade {
    #[serde(rename = "A+")]
    APlus,
    A,
    #[serde(rename = "B+")]
    BPlus,
    B,
    #[serde(rename = "C+")]
    CPlus,
    C,
    D,
    F,
}

// ============================================================
// STRUCTS
// ============================================================

/// Academic score record
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Score {
    pub id: i32,
    pub student_id: i32,
    pub subject: Subject,
    pub score: f32,
    pub grade: Grade,
    pub date: String,
    pub semester: String,
}

/// Request to add a score
#[derive(Debug, Deserialize)]
pub struct CreateScoreRequest {
    pub student_id: i32,
    pub subject: Subject,
    pub score: f32,
    pub semester: String,
}

/// Score analytics response
#[derive(Debug, Serialize)]
pub struct ScoreAnalytics {
    pub student_id: i32,
    pub subject: Subject,
    pub average_score: f32,
    pub highest_score: f32,
    pub lowest_score: f32,
    pub grade: Grade,
}