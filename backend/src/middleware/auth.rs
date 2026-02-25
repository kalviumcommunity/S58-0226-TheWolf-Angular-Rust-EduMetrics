// src/middleware/auth.rs
// ============================================================
// Fix: removed futures_util dependency.
// Uses actix_web::dev and std::pin::Pin directly instead.
// ============================================================

use actix_web::{
    body::EitherBody,
    dev::{forward_ready, Service, ServiceRequest, ServiceResponse, Transform},
    Error, HttpResponse,
};
use std::{
    env,
    future::{ready, Ready, Future},
    pin::Pin,
    rc::Rc,
};

use crate::errors::ErrorBody;

pub struct ApiKeyAuth;

impl<S, B> Transform<S, ServiceRequest> for ApiKeyAuth
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    B: 'static,
{
    type Response  = ServiceResponse<EitherBody<B>>;
    type Error     = Error;
    type Transform = ApiKeyAuthMiddleware<S>;
    type InitError = ();
    type Future    = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(ApiKeyAuthMiddleware { service: Rc::new(service) }))
    }
}

pub struct ApiKeyAuthMiddleware<S> {
    service: Rc<S>,
}

// Use Pin<Box<dyn Future>> instead of futures_util::LocalBoxFuture
type LocalBoxFuture<T> = Pin<Box<dyn Future<Output = T> + 'static>>;

impl<S, B> Service<ServiceRequest> for ApiKeyAuthMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    B: 'static,
{
    type Response = ServiceResponse<EitherBody<B>>;
    type Error    = Error;
    type Future   = LocalBoxFuture<Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let expected_key = env::var("API_KEY")
            .unwrap_or_else(|_| "dev-secret-key-123".to_string());

        let auth_header = req
            .headers()
            .get("Authorization")
            .and_then(|v| v.to_str().ok())
            .unwrap_or("")
            .to_string();

        let is_valid = if let Some(token) = auth_header.strip_prefix("Bearer ") {
            token == expected_key
        } else {
            false
        };

        if is_valid {
            let svc = Rc::clone(&self.service);
            Box::pin(async move {
                let res = svc.call(req).await?;
                Ok(res.map_into_left_body())
            })
        } else {
            let (request, _payload) = req.into_parts();

            let message = if auth_header.is_empty() {
                "Missing Authorization header. Use: Bearer <api-key>"
            } else {
                "Invalid API key. Access denied."
            };

            let response = HttpResponse::Unauthorized()
                .json(ErrorBody::new("UNAUTHORIZED", message))
                .map_into_right_body();

            Box::pin(async move {
                Ok(ServiceResponse::new(request, response))
            })
        }
    }
}