use actix_web::web;
use crate::handlers;

pub fn student_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/students")
            .route("", web::get().to(handlers::get_all_students))
            .route("", web::post().to(handlers::create_student))
    );
}