import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable, Subject, combineLatest, of } from 'rxjs';
import { takeUntil, map, catchError } from 'rxjs/operators';
import { StudentService } from '../../services/student.service';
import { GradeService } from '../../services/grade.service';
import { Student } from '../../models/student.interface';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
  private studentService = inject(StudentService);
  private gradeService   = inject(GradeService);

  private destroy$ = new Subject<void>();

  students$:      Observable<Student[]>;
  loading$:       Observable<boolean>;
  error$:         Observable<string | null>;
  totalStudents$: Observable<number>;
  totalPages$:    Observable<number>;
  stats$:         Observable<any>;

  currentPage        = 1;
  pageSize           = 9;
  searchQuery        = '';
  selectedStatus     = '';
  selectedDepartment = '';
  sortBy             = 'id';
  successMessage: string | null = null;

  selectedStudentId: number | null = null;
  selectedGrades: any[] = [];
  gradesLoading = false;

  // User info read directly from localStorage — no AuthService needed
  userName   = '';
  userRole   = '';

  constructor() {
    try {
      const raw = localStorage.getItem('edumetrics_user');
      if (raw) { const u = JSON.parse(raw); this.userName = u.name || ''; this.userRole = u.role || ''; }
    } catch { /* ignore */ }

    this.students$      = this.studentService.students$;
    this.loading$       = this.studentService.loading$;
    this.error$         = this.studentService.error$;
    this.totalStudents$ = this.studentService.totalStudents$;
    this.totalPages$    = this.studentService.totalPages$;

    this.stats$ = combineLatest([
      this.studentService.students$,
      this.studentService.totalStudents$
    ]).pipe(
      map(([students, total]) => ({
        totalStudents:  total,
        activeStudents: students.filter((s: Student) => s.status === 'active').length,
        averageGpa:     students.length ? students.reduce((sum: number, s: Student) => sum + s.gpa, 0) / students.length : 0,
        topPerformers:  students.filter((s: Student) => s.gpa >= 3.5)
      })),
      catchError(() => of({ totalStudents: 0, activeStudents: 0, averageGpa: 0, topPerformers: [] }))
    );
  }

  ngOnInit(): void { this.loadStudents(); }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadStudents(): void {
    this.studentService.getStudents(this.currentPage, this.pageSize, {
      status:     this.selectedStatus     || undefined,
      department: this.selectedDepartment || undefined,
      sort_by:    this.sortBy,
      order:      'asc',
      search:     this.searchQuery        || undefined
    }).pipe(takeUntil(this.destroy$))
      .subscribe({ error: (err: any) => console.error('Dashboard load error:', err) });
  }

  onSearchChange(query: string): void {
    this.currentPage = 1;
    if (query.trim().length > 1 || query.trim().length === 0) this.loadStudents();
  }

  applyFilter(): void  { this.currentPage = 1; this.loadStudents(); }
  retryLoad(): void    { this.studentService.clearError(); this.loadStudents(); }
  nextPage(): void     { this.currentPage++; this.loadStudents(); }
  prevPage(): void     { if (this.currentPage > 1) { this.currentPage--; this.loadStudents(); } }

  clearFilters(): void {
    this.searchQuery = ''; this.selectedStatus = '';
    this.selectedDepartment = ''; this.sortBy = 'id';
    this.currentPage = 1; this.loadStudents();
  }

  viewGrades(studentId: number): void {
    if (this.selectedStudentId === studentId) { this.selectedStudentId = null; return; }
    this.selectedStudentId = studentId;
    this.gradesLoading = true;
    this.selectedGrades = [];
    this.gradeService.getStudentGrades(studentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  (res: any) => { this.selectedGrades = res.grades; this.gradesLoading = false; },
        error: ()         => { this.gradesLoading = false; }
      });
  }

  deleteStudent(studentId: number): void {
    if (!confirm(`Delete student #${studentId}? This cannot be undone.`)) return;
    this.studentService.deleteStudent(studentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  () => { this.showSuccess(`Student #${studentId} deleted`); this.loadStudents(); },
        error: (err: any) => console.error('Delete error:', err)
      });
  }

  showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = null, 3000);
  }

  getGpaClass(gpa: number): string {
    if (gpa >= 3.5) return 'gpa-excellent';
    if (gpa >= 3.0) return 'gpa-good';
    if (gpa >= 2.0) return 'gpa-average';
    return 'gpa-low';
  }
}