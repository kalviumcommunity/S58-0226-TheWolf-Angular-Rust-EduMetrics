// frontend/src/app/components/students/students.component.ts
// ============================================================
// STUDENTS COMPONENT — Assignment 3.27
// Shows how to subscribe to service calls and handle ApiError
// with specific messages per error code.
// ============================================================

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StudentService } from '../../services/student.service';
import {
  Student,
  CreateStudentRequest,
  ApiError,
  ERROR_CODES,
} from '../../models/student.model';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './students.component.html',
})
export class StudentsComponent implements OnInit {
  students: Student[] = [];
  loading = false;

  // Error state — displayed in the template
  errorMessage = '';
  successMessage = '';

  // Create form
  createForm: FormGroup;

  constructor(
    private studentService: StudentService,
    private fb: FormBuilder
  ) {
    this.createForm = this.fb.group({
      name:            ['', [Validators.required, Validators.minLength(2)]],
      email:           ['', [Validators.required, Validators.email]],
      enrollment_date: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadStudents();
  }

  // ──────────────────────────────────────────────────────────
  // LOAD ALL STUDENTS
  // ──────────────────────────────────────────────────────────
  loadStudents(): void {
    this.loading = true;
    this.clearMessages();

    this.studentService.getStudents().subscribe({
      next: (res: any) => {
        this.students = res.students;
        this.loading = false;
      },
      error: (err: ApiError) => {
        this.loading = false;
        this.errorMessage = this.friendlyError(err);
      },
    });
  }

  // ──────────────────────────────────────────────────────────
  // CREATE STUDENT
  // ──────────────────────────────────────────────────────────
  onCreateSubmit(): void {
    if (this.createForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    const payload: CreateStudentRequest = this.createForm.value;
    this.loading = true;
    this.clearMessages();

    this.studentService.createStudent(payload).subscribe({
      next: (res: any) => {
        this.successMessage = res.message;
        this.createForm.reset();
        this.loading = false;
        this.loadStudents(); // refresh list
      },
      error: (err: ApiError) => {
        this.loading = false;
        this.errorMessage = this.friendlyError(err);
      },
    });
  }

  // ──────────────────────────────────────────────────────────
  // DELETE STUDENT
  // ──────────────────────────────────────────────────────────
  onDelete(id: number): void {
    if (!confirm(`Delete student #${id}?`)) return;

    this.clearMessages();

    this.studentService.deleteStudent(id).subscribe({
      next: (res: any) => {
        this.successMessage = res.message;
        this.students = this.students.filter((s) => s.id !== id);
      },
      error: (err: ApiError) => {
        this.errorMessage = this.friendlyError(err);
      },
    });
  }

  // ──────────────────────────────────────────────────────────
  // CONVERT ApiError → User-Friendly String
  // ──────────────────────────────────────────────────────────
  // This is the key pattern from Assignment 3.27:
  // use error_code (not status numbers) to display the right message.
  private friendlyError(err: ApiError): string {
    switch (err.errorCode) {
      case ERROR_CODES.NOT_FOUND:
        return `Not found: ${err.message}`;
      case ERROR_CODES.INVALID_INPUT:
        return `Validation error: ${err.message}`;
      case ERROR_CODES.CONFLICT:
        return `Conflict: ${err.message}`;
      case ERROR_CODES.INTERNAL_ERROR:
        return 'A server error occurred. Please try again later.';
      case ERROR_CODES.NETWORK_ERROR:
        return 'Cannot connect to the server. Is it running?';
      default:
        return err.message || 'An unexpected error occurred.';
    }
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}