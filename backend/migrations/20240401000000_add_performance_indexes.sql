-- ============================================================
-- MIGRATION 004 — Performance Indexes
-- Assignment 3.31: Query Optimization
-- ============================================================
-- What this migration does:
--   • Adds indexes for frequently filtered columns
--   • Improves search performance
--   • Optimizes sorting queries
-- ============================================================

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_students_status_gpa 
    ON students(status, gpa DESC);

-- Index for department filtering and sorting
CREATE INDEX IF NOT EXISTS idx_students_department_name 
    ON students(department, name);

-- Index for GPA range queries
CREATE INDEX IF NOT EXISTS idx_students_gpa_range 
    ON students(gpa DESC) 
    WHERE status = 'active';

-- Index for name/email search (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_students_name_search 
    ON students(LOWER(name));

CREATE INDEX IF NOT EXISTS idx_students_email_search 
    ON students(LOWER(email));

-- Composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_students_status_dept_gpa 
    ON students(status, department, gpa DESC);

-- Index for enrollment date sorting
CREATE INDEX IF NOT EXISTS idx_students_enrollment_date 
    ON students(enrollment_date DESC);