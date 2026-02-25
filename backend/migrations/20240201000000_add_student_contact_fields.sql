-- migrations/20240201000000_add_student_contact_fields.sql
-- ============================================================
-- MIGRATION 002 — Add contact fields to students table
-- Assignment 3.29: Schema versioning with SQLx
-- ============================================================
-- What this migration does:
--   • Adds phone (optional) to students
--   • Adds address (optional) to students
--   • Adds department (optional) to students
--   • Creates an index on department for filtering
-- ============================================================

ALTER TABLE students
    ADD COLUMN IF NOT EXISTS phone      VARCHAR(20)  DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS address    TEXT         DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT 'General';

-- Index for filtering students by department
CREATE INDEX IF NOT EXISTS idx_students_department ON students(department);

-- Update existing sample students with department values
UPDATE students SET department = 'Computer Science' WHERE email = 'alice@example.com';
UPDATE students SET department = 'Mathematics'      WHERE email = 'bob@example.com';
UPDATE students SET department = 'Physics'          WHERE email = 'carol@example.com';