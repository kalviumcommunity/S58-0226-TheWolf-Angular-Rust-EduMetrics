-- migrations/20240301000000_add_grades_table.sql
-- ============================================================
-- MIGRATION 003 — Add grades summary table
-- Assignment 3.29: Schema versioning with SQLx
-- ============================================================
-- What this migration does:
--   • Creates a grades table that stores computed semester GPA
--   • Adds a foreign key relationship back to students
--   • Adds indexes for common query patterns
--   • Adds a semester_rank column to scores for ordering
-- ============================================================

-- New grades summary table
CREATE TABLE IF NOT EXISTS grades (
    id           SERIAL PRIMARY KEY,
    student_id   INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    semester     VARCHAR(50)   NOT NULL,
    semester_gpa DECIMAL(3,2)  NOT NULL DEFAULT 0.0,
    credits      INTEGER       NOT NULL DEFAULT 0,
    standing     VARCHAR(50)   NOT NULL DEFAULT 'satisfactory',
    created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,

    -- A student can only have one grade record per semester
    UNIQUE(student_id, semester)
);

CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_semester   ON grades(semester);

-- Extend scores table: add a rank column for ordering within a semester
ALTER TABLE scores
    ADD COLUMN IF NOT EXISTS rank_in_class INTEGER DEFAULT NULL;

-- Seed sample grade data
INSERT INTO grades (student_id, semester, semester_gpa, credits, standing) VALUES
(1, 'Spring 2024', 3.80, 15, 'honors'),
(2, 'Spring 2024', 3.20, 15, 'satisfactory')
ON CONFLICT (student_id, semester) DO NOTHING;