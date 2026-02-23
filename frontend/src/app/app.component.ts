import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CounterDemoComponent } from './components/counter-demo/counter-demo.component';
import { StudentListComponent } from './components/student-list/student-list.component';
import { ProductTileComponent } from './components/product-tile/product-tile.component';
import { UserCardComponent } from './components/user-card/user-card.component';
import { ApiDemoComponent } from '../app/components/api-demo/api-demo.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    CommonModule,
    CounterDemoComponent,
    StudentListComponent,
    ProductTileComponent,
    UserCardComponent,
    ApiDemoComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'EduMetrics - Component Architecture Demo';
  currentView = 'api';

  views = [
    { id: 'api', name: '🔗 API Demo', component: 'api' },
    { id: 'students', name: '📊 Students Dashboard', component: 'students' },
    { id: 'counter', name: '🔢 Counter Demo', component: 'counter' },
    { id: 'product', name: '🛒 Product Tile', component: 'product' },
    { id: 'user', name: '👤 User Card', component: 'user' }
  ];

  switchView(viewId: string) {
    this.currentView = viewId;
  }
}