import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';
import { Student } from '../../models/student.interface';
import { StudentCardComponent } from '../student-card/student-card.component';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, FormsModule, StudentCardComponent],
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css']
})
export class StudentListComponent implements OnInit {
  students: Student[] = [];
  loading = false;
  error: string | null = null;
  
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
    this.loading = true;
    this.error = null;
    
    this.studentService.getStudents(this.currentPage, this.pageSize, this.filters)
      .subscribe({
        next: (response) => {
          this.students = response.data;
          this.totalStudents = response.total;
          this.totalPages = response.total_pages;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load students. Please try again.';
          this.loading = false;
          console.error('Error loading students:', err);
        }
      });
  }

  // Event handlers from child components
  handleViewDetails(studentId: number) {
    console.log('View details for student:', studentId);
    alert(`View details for student ID: ${studentId}`);
  }

  handleEditStudent(studentId: number) {
    console.log('Edit student:', studentId);
    alert(`Edit student ID: ${studentId}`);
  }

  handleDeleteStudent(studentId: number) {
    this.studentService.deleteStudent(studentId).subscribe({
      next: () => {
        alert('Student deleted successfully');
        this.loadStudents();
      },
      error: (err) => {
        alert('Failed to delete student');
        console.error(err);
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
}