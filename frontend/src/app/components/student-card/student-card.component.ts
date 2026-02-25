//frontend/src/app/components/student-card/student-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Student } from '../../models/student.interface';

@Component({
  selector: 'app-student-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-card.component.html',
  styleUrls: ['./student-card.component.css']
})
export class StudentCardComponent {
  // @Input - receives data from parent component
  @Input() student!: Student;
  
  // @Output - emits events to parent component
  @Output() viewDetails = new EventEmitter<number>();
  @Output() editStudent = new EventEmitter<number>();
  @Output() deleteStudent = new EventEmitter<number>();

  // Method called when view button is clicked
  onViewDetails() {
    this.viewDetails.emit(this.student.id);
  }

  onEdit() {
    this.editStudent.emit(this.student.id);
  }

  onDelete() {
    if (confirm(`Delete student ${this.student.name}?`)) {
      this.deleteStudent.emit(this.student.id);
    }
  }

  // Computed property for status badge color
  getStatusClass(): string {
    switch (this.student.status) {
      case 'active': return 'status-active';
      case 'suspended': return 'status-suspended';
      case 'graduated': return 'status-graduated';
      default: return 'status-default';
    }
  }

  // Computed property for GPA color
  getGpaClass(): string {
    if (this.student.gpa >= 3.5) return 'gpa-excellent';
    if (this.student.gpa >= 3.0) return 'gpa-good';
    if (this.student.gpa >= 2.0) return 'gpa-average';
    return 'gpa-low';
  }
}