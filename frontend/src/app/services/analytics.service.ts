import { Injectable } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { StudentService } from './student.service';
import { GradeService } from './grade.service';

export interface StudentAnalytics {
  totalStudents: number;
  activeStudents: number;
  averageGPA: number;
  departmentBreakdown: { [key: string]: number };
  performanceLevels: {
    excellent: number;
    good: number;
    average: number;
    needsImprovement: number;
  };
}

/**
 * Analytics Service - combines data from multiple services
 */
@Injectable({
  providedIn: 'root'
})
export class AnalyticsService extends BaseApiService {

  constructor(
    private studentService: StudentService,
    private gradeService: GradeService
  ) {
    super();
  }

  /**
   * Get comprehensive analytics dashboard data
   */
  getDashboardAnalytics(): Observable<StudentAnalytics> {
    return this.studentService.getStudents(1, 1000).pipe(
      map(response => {
        const students = response.data;

        // Calculate statistics
        const totalStudents = students.length;
        const activeStudents = students.filter(s => s.status === 'active').length;
        const averageGPA = students.reduce((sum, s) => sum + s.gpa, 0) / totalStudents;

        // Department breakdown
        const departmentBreakdown: { [key: string]: number } = {};
        students.forEach(s => {
          const dept = s.department || 'Unknown';
          departmentBreakdown[dept] = (departmentBreakdown[dept] || 0) + 1;
        });

        // Performance levels
        const performanceLevels = {
          excellent: students.filter(s => s.gpa >= 3.5).length,
          good: students.filter(s => s.gpa >= 3.0 && s.gpa < 3.5).length,
          average: students.filter(s => s.gpa >= 2.0 && s.gpa < 3.0).length,
          needsImprovement: students.filter(s => s.gpa < 2.0).length,
        };

        return {
          totalStudents,
          activeStudents,
          averageGPA,
          departmentBreakdown,
          performanceLevels
        };
      })
    );
  }

  /**
   * Get student performance trend
   */
  getStudentPerformanceTrend(studentId: number): Observable<any> {
    return this.gradeService.getStudentGrades(studentId).pipe(
      map(response => {
        const grades = response.grades.sort((a, b) => 
          a.semester.localeCompare(b.semester)
        );

        return {
          student_id: studentId,
          semesters: grades.map(g => g.semester),
          gpas: grades.map(g => g.semester_gpa),
          credits: grades.map(g => g.credits),
          trend: this.calculateTrend(grades.map(g => g.semester_gpa))
        };
      })
    );
  }

  /**
   * Calculate trend (improving, declining, stable)
   */
  private calculateTrend(gpas: number[]): string {
    if (gpas.length < 2) return 'insufficient-data';

    const recent = gpas.slice(-3);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const older = gpas.slice(0, -3);
    const oldAvg = older.reduce((a, b) => a + b, 0) / older.length;

    const diff = avg - oldAvg;

    if (diff > 0.2) return 'improving';
    if (diff < -0.2) return 'declining';
    return 'stable';
  }
}