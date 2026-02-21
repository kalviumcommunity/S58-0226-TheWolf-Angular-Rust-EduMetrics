use serde::Deserialize;

// ============================================================
// PAGINATION & FILTERING QUERY PARAMETERS
// ============================================================

/// Query parameters for student listing
#[derive(Debug, Deserialize)]
pub struct StudentQuery {
    // Pagination
    pub page: Option<i64>,
    pub limit: Option<i64>,
    
    // Filtering
    pub status: Option<String>,
    pub department: Option<String>,
    pub min_gpa: Option<f32>,
    pub search: Option<String>,
    
    // Sorting
    pub sort_by: Option<String>,
    pub order: Option<String>,
}

impl StudentQuery {
    /// Get page number with default
    pub fn get_page(&self) -> i64 {
        self.page.unwrap_or(1).max(1)
    }
    
    /// Get limit with default and max cap
    pub fn get_limit(&self) -> i64 {
        self.limit.unwrap_or(10).min(100).max(1)
    }
    
    /// Calculate offset for SQL query
    pub fn get_offset(&self) -> i64 {
        (self.get_page() - 1) * self.get_limit()
    }
    
    /// Get sort column with validation
    pub fn get_sort_by(&self) -> &str {
        match self.sort_by.as_deref() {
            Some("name") => "name",
            Some("email") => "email",
            Some("gpa") => "gpa",
            Some("enrollment_date") => "enrollment_date",
            _ => "id",
        }
    }
    
    /// Get sort order
    pub fn get_order(&self) -> &str {
        match self.order.as_deref() {
            Some("desc") => "DESC",
            _ => "ASC",
        }
    }
}

/// Paginated response wrapper
#[derive(Debug, serde::Serialize)]
pub struct PaginatedResponse<T> {
    pub page: i64,
    pub limit: i64,
    pub total: i64,
    pub total_pages: i64,
    pub data: Vec<T>,
}

impl<T> PaginatedResponse<T> {
    pub fn new(page: i64, limit: i64, total: i64, data: Vec<T>) -> Self {
        let total_pages = (total as f64 / limit as f64).ceil() as i64;
        Self {
            page,
            limit,
            total,
            total_pages,
            data,
        }
    }
}