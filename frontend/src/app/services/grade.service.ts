import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';

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

/**
 * Grade API Service - handles student grade operations
 */
@Injectable({
  providedIn: 'root'
})
export class GradeService extends BaseApiService {
  private readonly GRADES_ENDPOINT = '/api/students';

  /**
   * Get all grades for a student
   */
  getStudentGrades(studentId: number): Observable<GradeResponse> {
    return this.get<GradeResponse>(`${this.GRADES_ENDPOINT}/${studentId}/grades`).pipe(
      tap(response => console.log(`✅ Loaded ${response.total} grades for student ${studentId}`))
    );
  }

  /**
   * Add grade for student
   */
  addGrade(
    studentId: number,
    grade: {
      semester: string;
      semester_gpa: number;
      credits: number;
      standing?: string;
    }
  ): Observable<any> {
    return this.post(`${this.GRADES_ENDPOINT}/${studentId}/grades`, grade).pipe(
      tap(() => console.log('✅ Grade added'))
    );
  }

  /**
   * Calculate cumulative GPA
   */
  calculateCumulativeGPA(grades: Grade[]): number {
    if (grades.length === 0) return 0;
    
    const totalCredits = grades.reduce((sum, g) => sum + g.credits, 0);
    const weightedSum = grades.reduce((sum, g) => sum + (g.semester_gpa * g.credits), 0);
    
    return totalCredits > 0 ? weightedSum / totalCredits : 0;
  }
}