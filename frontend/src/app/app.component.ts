import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CounterDemoComponent } from './components/counter-demo/counter-demo.component';
import { StudentListComponent } from './components/student-list/student-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, CounterDemoComponent, StudentListComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'EduMetrics - Student Analytics';
  showCounter = false;
  showStudents = true;

  toggleView(view: string) {
    this.showCounter = view === 'counter';
    this.showStudents = view === 'students';
  }
}