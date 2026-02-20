// frontend/src/app/models/student.model.ts
// ============================================================
// STUDENT MODELS — Assignment 3.27
// Mirrors the Rust structs and adds the ApiError type that
// the service throws when the backend returns an error body.
// ============================================================

// ──────────────────────────────────────────────────────────
// ENUMS (match Rust serde rename_all = "lowercase")
// ──────────────────────────────────────────────────────────
export type EnrollmentStatus = 'active' | 'suspended' | 'graduated' | 'withdrawn';
export type PerformanceLevel = 'excellent' | 'good' | 'average' | 'needsimprovement' | 'atrisk';

// ──────────────────────────────────────────────────────────
// DOMAIN MODEL
// ──────────────────────────────────────────────────────────
export interface Student {
  id: number;
  name: string;
  email: string;
  enrollment_date: string;   // ISO date string  e.g. "2024-01-15"
  status: EnrollmentStatus;
  gpa: number;
  performance_level: PerformanceLevel;
}

// ──────────────────────────────────────────────────────────
// REQUEST MODELS
// ──────────────────────────────────────────────────────────
export interface CreateStudentRequest {
  name: string;
  email: string;
  enrollment_date: string;   // "YYYY-MM-DD"
}

export interface UpdateStudentRequest {
  name?: string;
  email?: string;
  status?: EnrollmentStatus;
}

// ──────────────────────────────────────────────────────────
// RESPONSE MODELS  (match Rust response structs)
// ──────────────────────────────────────────────────────────
export interface StudentResponse {
  id: number;
  name: string;
  email: string;
  status: EnrollmentStatus;
  message: string;
}

export interface StudentListResponse {
  students: Student[];
  total: number;
}

// ──────────────────────────────────────────────────────────
// API ERROR  (matches Rust ErrorBody + http status)
// ──────────────────────────────────────────────────────────
export interface ApiError {
  /** HTTP status code (0 = network failure) */
  statusCode: number;
  /** Machine-readable code from the Rust backend, e.g. "NOT_FOUND" */
  errorCode: string;
  /** Human-readable message safe to display */
  message: string;
}

// ──────────────────────────────────────────────────────────
// ERROR CODE CONSTANTS  (avoids magic strings in components)
// ──────────────────────────────────────────────────────────
export const ERROR_CODES = {
  NOT_FOUND:            'NOT_FOUND',
  INVALID_INPUT:        'INVALID_INPUT',
  CONFLICT:             'CONFLICT',
  INTERNAL_ERROR:       'INTERNAL_ERROR',
  NETWORK_ERROR:        'NETWORK_ERROR',
  INVALID_JSON:         'INVALID_JSON',
  UNPROCESSABLE_ENTITY: 'UNPROCESSABLE_ENTITY',
  UNKNOWN_ERROR:        'UNKNOWN_ERROR',
} as const;