// frontend/src/app/services/grade.service.ts
// ============================================================
// GRADE SERVICE — Assignment 3.42
// Demonstrates:
//   • Observable chaining with switchMap (dependent API calls)
//   • map() to transform/enrich response data
//   • combineLatest for parallel data fetching
//   • catchError with fallback using of()
//
// FIX: catchError handlers now read err.userMessage (attached by
// BaseApiService.handleError) so error messages display correctly.
// ============================================================

import { Injectable } from '@angular/core';
import { Observable, of, combineLatest } from 'rxjs';
import { tap, map, catchError, switchMap } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';

// ──────────────────────────────────────────────────────────
// INTERFACES
// ──────────────────────────────────────────────────────────

export interface Grade {
  id: number;
  student_id: number;
  semester: string;
  semester_gpa: number;
  credits: number;
  standing: string;
}

export interface GradeResponse {
  student_id: number;
  total: number;
  grades: Grade[];
}

export interface GradeWithStats extends GradeResponse {
  cumulative_gpa: number;
  highest_gpa: number;
  lowest_gpa: number;
  total_credits: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface CreateGradeRequest {
  semester: string;
  semester_gpa: number;
  credits: number;
  standing?: string;
}

// ──────────────────────────────────────────────────────────
// SERVICE
// ──────────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root'
})
export class GradeService extends BaseApiService {

  private readonly BASE = '/api/students';

  // ============================================================
  // CORE METHODS
  // ============================================================

  /**
   * Get all grades for a student.
   * Pure Observable — component subscribes to receive data.
   */
  getStudentGrades(studentId: number): Observable<GradeResponse> {
    return this.get<GradeResponse>(`${this.BASE}/${studentId}/grades`).pipe(
      tap(res => console.log(`✅ Loaded ${res.total} grades for student ${studentId}`)),
      catchError(err => {
        // FIX: read userMessage attached by BaseApiService.handleError
        const msg = (err as any).userMessage || err.message || 'Failed to load grades';
        console.error(`❌ getStudentGrades(${studentId}):`, msg);
        throw err;
      })
    );
  }

  /**
   * Get grades enriched with calculated statistics.
   * map() transforms the raw API response before the component sees it.
   */
  getStudentGradesWithStats(studentId: number): Observable<GradeWithStats> {
    return this.getStudentGrades(studentId).pipe(
      map(response => this.enrichWithStats(response))
    );
  }

  /**
   * Add or update a grade for a student.
   */
  addGrade(studentId: number, grade: CreateGradeRequest): Observable<any> {
    return this.post(`${this.BASE}/${studentId}/grades`, grade).pipe(
      tap(() => console.log(`✅ Grade added for student ${studentId}`)),
      catchError(err => {
        const msg = (err as any).userMessage || err.message || 'Failed to add grade';
        console.error(`❌ addGrade(${studentId}):`, msg);
        throw err;
      })
    );
  }

  // ============================================================
  // RXJS PATTERNS — ADVANCED OBSERVABLE USE CASES
  // ============================================================

  /**
   * switchMap example: fetch student, then fetch their grades.
   * switchMap cancels any previous in-flight request if called again.
   * Used for dependent async calls (first get student, then get grades).
   */
  getGradesForStudent(studentId: number): Observable<GradeWithStats> {
    return this.get<any>(`${this.BASE}/${studentId}`).pipe(
      // switchMap: takes the student, returns a new Observable (grades)
      switchMap(student => {
        console.log(`📚 Fetching grades for: ${student.name}`);
        return this.getStudentGradesWithStats(student.id);
      }),
      catchError(err => {
        const msg = (err as any).userMessage || err.message || 'Failed to load student grades';
        console.error('❌ getGradesForStudent chain error:', msg);
        // of() creates a safe fallback Observable instead of crashing
        return of({
          student_id: studentId,
          total: 0,
          grades: [],
          cumulative_gpa: 0,
          highest_gpa: 0,
          lowest_gpa: 0,
          total_credits: 0,
          trend: 'stable' as const
        });
      })
    );
  }

  /**
   * combineLatest example: fetch grades for multiple students in parallel.
   * combineLatest waits for ALL Observables to emit, then combines results.
   */
  getGradesForMultipleStudents(studentIds: number[]): Observable<GradeResponse[]> {
    if (studentIds.length === 0) return of([]);

    const gradeObservables = studentIds.map(id =>
      this.getStudentGrades(id).pipe(
        catchError(() => of({ student_id: id, total: 0, grades: [] }))
      )
    );

    // combineLatest fires when ALL inner Observables have emitted
    return combineLatest(gradeObservables);
  }

  // ============================================================
  // LOCAL CALCULATION UTILITIES
  // ============================================================

  /**
   * Calculate cumulative GPA from an array of grades.
   * Credit-weighted average.
   */
  calculateCumulativeGPA(grades: Grade[]): number {
    if (grades.length === 0) return 0;
    const totalCredits = grades.reduce((sum, g) => sum + g.credits, 0);
    const weightedSum  = grades.reduce((sum, g) => sum + g.semester_gpa * g.credits, 0);
    return totalCredits > 0 ? Math.round((weightedSum / totalCredits) * 100) / 100 : 0;
  }

  /**
   * Determine GPA trend based on last 3 semesters.
   */
  calculateTrend(grades: Grade[]): 'improving' | 'declining' | 'stable' {
    if (grades.length < 2) return 'stable';
    const sorted = [...grades].sort((a, b) => a.semester.localeCompare(b.semester));
    const recent = sorted.slice(-3);
    const first  = recent[0].semester_gpa;
    const last   = recent[recent.length - 1].semester_gpa;
    if (last - first > 0.1) return 'improving';
    if (first - last > 0.1) return 'declining';
    return 'stable';
  }

  // ── PRIVATE HELPERS ──────────────────────────────────────

  private enrichWithStats(response: GradeResponse): GradeWithStats {
    const grades = response.grades;
    return {
      ...response,
      cumulative_gpa: this.calculateCumulativeGPA(grades),
      highest_gpa:    grades.length ? Math.max(...grades.map(g => g.semester_gpa)) : 0,
      lowest_gpa:     grades.length ? Math.min(...grades.map(g => g.semester_gpa)) : 0,
      total_credits:  grades.reduce((sum, g) => sum + g.credits, 0),
      trend:          this.calculateTrend(grades)
    };
  }
}