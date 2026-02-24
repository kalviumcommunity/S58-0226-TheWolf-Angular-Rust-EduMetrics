import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
export class StudentListComponent implements OnInit {
  students: Student[] = [];
  
  // UI State Management
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

  constructor(private studentService: StudentService) {}

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    // Set loading state BEFORE API call
    this.loading = true;
    this.error = null;
    this.errorCode = '';
    
    this.studentService.getStudents(this.currentPage, this.pageSize, {
      ...this.filters,
      min_gpa: this.filters.min_gpa ?? undefined
    })
      .subscribe({
        next: (response) => {
          // SUCCESS: Update data and clear loading
          this.students = response.data;
          this.totalStudents = response.total;
          this.totalPages = response.total_pages;
          this.loading = false;
          
          console.log('✅ Students loaded successfully');
        },
        error: (err) => {
          // ERROR: Show error message and clear loading
          this.loading = false;
          this.error = err.message || 'Failed to load students';
          
          // Extract error code if available
          if (err.message.includes('404')) {
            this.errorCode = 'NOT_FOUND';
          } else if (err.message.includes('500')) {
            this.errorCode = 'SERVER_ERROR';
          } else if (err.message.includes('Network')) {
            this.errorCode = 'NETWORK_ERROR';
          } else {
            this.errorCode = 'UNKNOWN_ERROR';
          }
          
          console.error('❌ Error loading students:', err);
        }
      });
  }

  // Event handlers from child components
  handleViewDetails(studentId: number) {
    console.log('View details for student:', studentId);
    // Could navigate to detail page or show modal
    this.showSuccess(`Viewing details for student ID: ${studentId}`);
  }

  handleEditStudent(studentId: number) {
    console.log('Edit student:', studentId);
    // Could navigate to edit page or show modal
    this.showSuccess('Edit feature coming soon!');
  }

  handleDeleteStudent(studentId: number) {
    // Set loading state for delete operation
    this.loading = true;
    this.error = null;
    
    this.studentService.deleteStudent(studentId).subscribe({
      next: () => {
        this.showSuccess('Student deleted successfully');
        this.loadStudents(); // Reload list
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to delete student: ' + err.message;
        this.errorCode = 'DELETE_ERROR';
      }
    });
  }

  // Pagination
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadStudents();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadStudents();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadStudents();
  }

  // Filtering
  applyFilters() {
    this.currentPage = 1;
    this.loadStudents();
  }

  clearFilters() {
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

  // Utility methods
  dismissError() {
    this.error = null;
    this.errorCode = '';
  }

  showSuccess(message: string) {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }

  retryLoad() {
    this.loadStudents();
  }
}