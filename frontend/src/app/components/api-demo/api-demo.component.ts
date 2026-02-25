//frontend/src/app/components/api-demo/api-demo.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';
import { Student } from '../../models/student.interface';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { ErrorAlertComponent } from '../error-alert/error-alert.component';

// In imports array:
imports: [
  CommonModule, 
  FormsModule,
  LoadingSpinnerComponent,
  ErrorAlertComponent
]

@Component({
  selector: 'app-api-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './api-demo.component.html',
  styleUrls: ['./api-demo.component.css']
})
export class ApiDemoComponent implements OnInit {
  // Use inject() to get service instance BEFORE properties are initialized
  private studentService = inject(StudentService);
  
  // Now these can safely use studentService
  loading$ = this.studentService.loading$;
  error$ = this.studentService.error$;
  
  // API Response Data
  students: Student[] = [];
  selectedStudent: Student | null = null;
  
  // Form Data
  newStudent = {
    name: '',
    email: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    department: 'Computer Science'
  };
  
  updateData = {
    name: '',
    email: ''
  };
  
  // Request Logs
  requestLogs: string[] = [];

  // No constructor needed with inject()

  ngOnInit() {
    this.addLog('🚀 Component initialized');
    this.loadStudents();
  }

  // ══════════════════════════════════════════════════════════
  // GET REQUEST - Fetch All Students
  // ══════════════════════════════════════════════════════════
  loadStudents() {
    this.addLog('📡 GET /api/students - Fetching all students...');
    
    this.studentService.getStudents(1, 10).subscribe({
      next: (response) => {
        this.students = response.data;
        this.addLog(`✅ Received ${response.data.length} students (Total: ${response.total})`);
      },
      error: (err) => {
        this.addLog(`❌ Error: ${err.message}`);
      }
    });
  }

  // ══════════════════════════════════════════════════════════
  // GET REQUEST - Fetch Single Student
  // ══════════════════════════════════════════════════════════
  loadStudent(id: number) {
    this.addLog(`📡 GET /api/students/${id} - Fetching student details...`);
    
    this.studentService.getStudentById(id).subscribe({
      next: (student) => {
        this.selectedStudent = student;
        this.addLog(`✅ Loaded: ${student.name} (${student.email})`);
      },
      error: (err) => {
        this.addLog(`❌ Error: ${err.message}`);
      }
    });
  }

  // ══════════════════════════════════════════════════════════
  // POST REQUEST - Create Student
  // ══════════════════════════════════════════════════════════
  createStudent() {
    if (!this.newStudent.name || !this.newStudent.email) {
      this.addLog('❌ Validation: Name and email required');
      return;
    }
    
    this.addLog(`📡 POST /api/students - Creating "${this.newStudent.name}"...`);
    
    this.studentService.createStudent(this.newStudent).subscribe({
      next: (response) => {
        this.addLog(`✅ Created student ID: ${response.id}`);
        this.newStudent = {
          name: '',
          email: '',
          enrollment_date: new Date().toISOString().split('T')[0],
          department: 'Computer Science'
        };
        this.loadStudents(); // Refresh list
      },
      error: (err) => {
        this.addLog(`❌ Error: ${err.message}`);
      }
    });
  }

  // ══════════════════════════════════════════════════════════
  // PUT REQUEST - Update Student
  // ══════════════════════════════════════════════════════════
  updateStudent(id: number) {
    if (!this.updateData.name && !this.updateData.email) {
      this.addLog('❌ Validation: At least one field required');
      return;
    }
    
    this.addLog(`📡 PUT /api/students/${id} - Updating student...`);
    
    this.studentService.updateStudent(id, this.updateData).subscribe({
      next: (response) => {
        this.addLog(`✅ Updated student successfully`);
        this.updateData = { name: '', email: '' };
        this.loadStudents(); // Refresh list
      },
      error: (err) => {
        this.addLog(`❌ Error: ${err.message}`);
      }
    });
  }

  // ══════════════════════════════════════════════════════════
  // DELETE REQUEST - Remove Student
  // ══════════════════════════════════════════════════════════
  deleteStudent(id: number, name: string) {
    if (!confirm(`Delete ${name}?`)) return;
    
    this.addLog(`📡 DELETE /api/students/${id} - Removing student...`);
    
    this.studentService.deleteStudent(id).subscribe({
      next: (response) => {
        this.addLog(`✅ Deleted student successfully`);
        this.loadStudents(); // Refresh list
      },
      error: (err) => {
        this.addLog(`❌ Error: ${err.message}`);
      }
    });
  }

  // ══════════════════════════════════════════════════════════
  // Utility - Add Log Entry
  // ══════════════════════════════════════════════════════════
  addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.requestLogs.unshift(`[${timestamp}] ${message}`);
    
    // Keep only last 10 logs
    if (this.requestLogs.length > 10) {
      this.requestLogs.pop();
    }
    
    console.log(message);
  }

  clearLogs() {
    this.requestLogs = [];
    this.addLog('🧹 Logs cleared');
  }
}