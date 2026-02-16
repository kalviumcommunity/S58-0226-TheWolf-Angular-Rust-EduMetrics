use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Student {
    pub id: i32,
    pub name: String,
    pub email: String,
    pub enrollment_date: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateStudent {
    pub name: String,
    pub email: String,
}

#[derive(Debug, Serialize)]
pub struct StudentResponse {
    pub id: i32,
    pub name: String,
    pub email: String,
    pub status: String,
}