use actix_web::{HttpResponse, Responder};
use crate::models::{CreateStudent, StudentResponse};

pub async fn get_all_students() -> impl Responder {
    // Mock data for demonstration
    let students = vec![
        StudentResponse {
            id: 1,
            name: "John Doe".to_string(),
            email: "john@example.com".to_string(),
            status: "Active".to_string(),
        },
    ];
    HttpResponse::Ok().json(students)
}

pub async fn create_student(student: actix_web::web::Json<CreateStudent>) -> impl Responder {
    let new_student = StudentResponse {
        id: 1,
        name: student.name.clone(),
        email: student.email.clone(),
        status: "Active".to_string(),
    };
    HttpResponse::Created().json(new_student)
}