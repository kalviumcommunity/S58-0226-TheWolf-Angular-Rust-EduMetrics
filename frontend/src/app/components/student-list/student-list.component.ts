// frontend/src/app/components/student-list/student-list.component.ts
// ============================================================
// STUDENT LIST COMPONENT — Assignment 3.42
// Demonstrates:
//   • Subscribing to Observables with proper error handling
//   • takeUntil + Subject for memory-safe unsubscription
//   • Loading/error/success state from Observable streams
// ============================================================

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StudentService } from '../../services/student.service';
import { Student } from '../../models/student.interface';
import { StudentCardComponent } from '../student-card/student-card.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { ErrorAlertComponent } from '../error-alert/error-alert.component';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StudentCardComponent,
    LoadingSpinnerComponent,
    ErrorAlertComponent
  ],
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css']
})
export class StudentListComponent implements OnInit, OnDestroy {
  students: Student[] = [];

  // UI State
  loading = false;
  error: string | null = null;
  errorCode: string = '';
  successMessage: string | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 9;
  totalStudents = 0;
  totalPages = 0;

  // Filters
  filters = {
    status: '',
    department: '',
    min_gpa: null as number | null,
    search: '',
    sort_by: 'id',
    order: 'asc'
  };

  // ── MEMORY LEAK PREVENTION ───────────────────────────────
  // destroy$ emits when component is destroyed, completing all takeUntil() subs
  private destroy$ = new Subject<void>();

  constructor(private studentService: StudentService) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  /**
   * Emit on destroy$ to auto-complete all active subscriptions.
   * Without this, subscriptions would live on after the component is gone.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStudents(): void {
    this.loading = true;
    this.error = null;
    this.errorCode = '';

    this.studentService.getStudents(this.currentPage, this.pageSize, {
      ...this.filters,
      // Convert null → undefined (TypeScript type compatibility)
      min_gpa: this.filters.min_gpa ?? undefined
    })
    // takeUntil: automatically unsubscribes when destroy$ emits
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        this.students = response.data;
        this.totalStudents = response.total;
        this.totalPages = response.total_pages;
        this.loading = false;
        console.log('✅ Students loaded successfully');
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Failed to load students';

        if (err.message.includes('404')) {
          this.errorCode = 'NOT_FOUND';
        } else if (err.message.includes('500')) {
          this.errorCode = 'SERVER_ERROR';
        } else if (err.message.includes('Network') || err.message.includes('connect')) {
          this.errorCode = 'NETWORK_ERROR';
        } else {
          this.errorCode = 'UNKNOWN_ERROR';
        }

        console.error('❌ Error loading students:', err);
      }
    });
  }

  // ── CHILD COMPONENT EVENT HANDLERS ──────────────────────

  handleViewDetails(studentId: number): void {
    console.log('View details for student:', studentId);
    this.showSuccess(`Viewing details for student ID: ${studentId}`);
  }

  handleEditStudent(studentId: number): void {
    console.log('Edit student:', studentId);
    this.showSuccess('Edit feature coming soon!');
  }

  handleDeleteStudent(studentId: number): void {
    this.loading = true;
    this.error = null;

    this.studentService.deleteStudent(studentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Student deleted successfully');
          this.loadStudents();
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Failed to delete student: ' + err.message;
          this.errorCode = 'DELETE_ERROR';
        }
      });
  }

  // ── PAGINATION ───────────────────────────────────────────

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadStudents();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadStudents();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadStudents();
  }

  // ── FILTERING ────────────────────────────────────────────

  applyFilters(): void {
    this.currentPage = 1;
    this.loadStudents();
  }

  clearFilters(): void {
    this.filters = {
      status: '',
      department: '',
      min_gpa: null,
      search: '',
      sort_by: 'id',
      order: 'asc'
    };
    this.currentPage = 1;
    this.loadStudents();
  }

  // ── UTILITIES ────────────────────────────────────────────

  dismissError(): void {
    this.error = null;
    this.errorCode = '';
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => { this.successMessage = null; }, 3000);
  }

  retryLoad(): void {
    this.loadStudents();
  }
}