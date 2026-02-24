import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';
import { GradeService } from '../../services/grade.service';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-service-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-demo.component.html',
  styleUrls: ['./service-demo.component.css']
})
export class ServiceDemoComponent implements OnInit {
  // Inject services using modern inject() function
  private studentService = inject(StudentService);
  private gradeService = inject(GradeService);
  private analyticsService = inject(AnalyticsService);

  // Reactive observables from services
  students$ = this.studentService.students$;
  loading$ = this.studentService.loading$;
  error$ = this.studentService.error$;

  // Analytics data
  analytics: any = null;
  performanceTrend: any = null;

  // Search
  searchQuery = '';

  ngOnInit() {
    this.loadData();
  }

  /**
   * Load all data using reusable services
   */
  loadData() {
    // Load students
    this.studentService.getStudents(1, 10).subscribe();

    // Load analytics
    this.analyticsService.getDashboardAnalytics().subscribe({
      next: (data) => {
        this.analytics = data;
        console.log('✅ Analytics loaded:', data);
      },
      error: (err) => console.error('❌ Analytics error:', err)
    });
  }

  /**
   * Search students using service method
   */
  searchStudents() {
    if (this.searchQuery.trim()) {
      this.studentService.searchStudents(this.searchQuery).subscribe();
    }
  }

  /**
   * Get high performers using service method
   */
  loadHighPerformers() {
    this.studentService.getHighPerformers(3.5).subscribe();
  }

  /**
   * Load student performance trend
   */
  loadPerformanceTrend(studentId: number) {
    this.analyticsService.getStudentPerformanceTrend(studentId).subscribe({
      next: (trend) => {
        this.performanceTrend = trend;
        console.log('✅ Performance trend:', trend);
      },
      error: (err) => console.error('❌ Trend error:', err)
    });
  }

  /**
   * Refresh data
   */
  refresh() {
    this.loadData();
  }
}