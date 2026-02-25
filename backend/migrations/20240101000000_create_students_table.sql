-- migrations/20240101000000_create_students_table.sql
-- ============================================================
-- MIGRATION 001 — Initial Schema
-- Fixed: Added IF NOT EXISTS to all CREATE INDEX statements
-- so re-running after a _sqlx_migrations reset does not fail
-- ============================================================

-- ── STUDENTS TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
    id               SERIAL PRIMARY KEY,
    name             VARCHAR(255) NOT NULL,
    email            VARCHAR(255) NOT NULL UNIQUE,
    enrollment_date  DATE         NOT NULL,
    status           VARCHAR(50)  NOT NULL DEFAULT 'active',
    gpa              DECIMAL(3,2)          DEFAULT 0.0,
    performance_level VARCHAR(50)          DEFAULT 'average',
    created_at       TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP             DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_students_email  ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);

-- ── SCORES TABLE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scores (
    id          SERIAL PRIMARY KEY,
    student_id  INTEGER      NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject     VARCHAR(100) NOT NULL,
    score       DECIMAL(5,2) NOT NULL,
    grade       VARCHAR(5)   NOT NULL,
    date        DATE         NOT NULL,
    semester    VARCHAR(50)  NOT NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scores_student_id ON scores(student_id);

-- ── ATTENDANCE TABLE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
    id          SERIAL PRIMARY KEY,
    student_id  INTEGER      NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    date        DATE         NOT NULL,
    status      VARCHAR(50)  NOT NULL,
    class_name  VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, date, class_name)
);

CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);

-- ── SAMPLE DATA ──────────────────────────────────────────────
-- INSERT IGNORE pattern: do nothing if email already exists
INSERT INTO students (name, email, enrollment_date, status, gpa, performance_level)
VALUES
    ('Alice Johnson', 'alice@example.com', '2024-01-15', 'active', 3.8, 'excellent'),
    ('Bob Smith',     'bob@example.com',   '2024-01-20', 'active', 3.2, 'good'),
    ('Carol Williams','carol@example.com', '2024-02-01', 'active', 3.5, 'good')
ON CONFLICT (email) DO NOTHING;

INSERT INTO scores (student_id, subject, score, grade, date, semester)
SELECT s.id, 'mathematics', 95.0, 'A', '2024-03-15', 'Spring 2024'
FROM students s WHERE s.email = 'alice@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO scores (student_id, subject, score, grade, date, semester)
SELECT s.id, 'science', 92.0, 'A', '2024-03-15', 'Spring 2024'
FROM students s WHERE s.email = 'alice@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO scores (student_id, subject, score, grade, date, semester)
SELECT s.id, 'mathematics', 85.0, 'B', '2024-03-15', 'Spring 2024'
FROM students s WHERE s.email = 'bob@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO scores (student_id, subject, score, grade, date, semester)
SELECT s.id, 'science', 88.0, 'B+', '2024-03-15', 'Spring 2024'
FROM students s WHERE s.email = 'bob@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO attendance (student_id, date, status, class_name)
SELECT s.id, '2024-03-01', 'present', 'Mathematics 101'
FROM students s WHERE s.email = 'alice@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO attendance (student_id, date, status, class_name)
SELECT s.id, '2024-03-02', 'present', 'Science 101'
FROM students s WHERE s.email = 'alice@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO attendance (student_id, date, status, class_name)
SELECT s.id, '2024-03-01', 'present', 'Mathematics 101'
FROM students s WHERE s.email = 'bob@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO attendance (student_id, date, status, class_name)
SELECT s.id, '2024-03-02', 'absent', 'Science 101'
FROM students s WHERE s.email = 'bob@example.com'
ON CONFLICT DO NOTHING;