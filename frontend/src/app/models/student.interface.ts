// frontend/src/app/models/student.interface.ts
// ============================================================
// STUDENT INTERFACES — Assignment 3.42
// Type definitions that match the Rust backend response shapes.
// ============================================================

export interface Student {
  id: number;
  name: string;
  email: string;
  enrollment_date: string;
  status: string;
  gpa: number;
  performance_level: string;
  phone?: string;
  address?: string;
  department?: string;
}

/**
 * Matches the Rust PaginatedResponse<Student> shape:
 * { page, limit, total, total_pages, data }
 */
export interface PaginatedStudents {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  data: Student[];
}

export interface CreateStudentRequest {
  name: string;
  email: string;
  enrollment_date: string;
  phone?: string;
  address?: string;
  department?: string;
}

export interface UpdateStudentRequest {
  name?: string;
  email?: string;
  status?: string;
  phone?: string;
  address?: string;
  department?: string;
}