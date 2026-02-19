-- ============================================================
-- STUDENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    enrollment_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    gpa DECIMAL(3,2) DEFAULT 0.0,
    performance_level VARCHAR(50) DEFAULT 'average',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_students_email ON students(email);

-- Create index on status for filtering
CREATE INDEX idx_students_status ON students(status);

-- ============================================================
-- SCORES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    grade VARCHAR(5) NOT NULL,
    date DATE NOT NULL,
    semester VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on student_id for faster lookups
CREATE INDEX idx_scores_student_id ON scores(student_id);

-- ============================================================
-- ATTENDANCE TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    class_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, date, class_name)
);

-- Create index on student_id for faster lookups
CREATE INDEX idx_attendance_student_id ON attendance(student_id);

-- ============================================================
-- INSERT SAMPLE DATA
-- ============================================================
INSERT INTO students (name, email, enrollment_date, status, gpa, performance_level) VALUES
('Alice Johnson', 'alice@example.com', '2024-01-15', 'active', 3.8, 'excellent'),
('Bob Smith', 'bob@example.com', '2024-01-20', 'active', 3.2, 'good'),
('Carol Williams', 'carol@example.com', '2024-02-01', 'active', 3.5, 'good');

INSERT INTO scores (student_id, subject, score, grade, date, semester) VALUES
(1, 'mathematics', 95.0, 'A', '2024-03-15', 'Spring 2024'),
(1, 'science', 92.0, 'A', '2024-03-15', 'Spring 2024'),
(2, 'mathematics', 85.0, 'B', '2024-03-15', 'Spring 2024'),
(2, 'science', 88.0, 'B+', '2024-03-15', 'Spring 2024');

INSERT INTO attendance (student_id, date, status, class_name) VALUES
(1, '2024-03-01', 'present', 'Mathematics 101'),
(1, '2024-03-02', 'present', 'Science 101'),
(2, '2024-03-01', 'present', 'Mathematics 101'),
(2, '2024-03-02', 'absent', 'Science 101');