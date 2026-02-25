import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'EduMetrics';
  private router = inject(Router);

  showNav        = false;
  mobileMenuOpen = false;
  userName       = '';
  userRole       = '';
  userAvatar     = '';

  navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/students',  label: 'Students',  icon: '🎓' },
    { path: '/services',  label: 'Services',  icon: '🔧' },
    { path: '/counter',   label: 'Counter',   icon: '🔢' },
    { path: '/product',   label: 'Product',   icon: '🛒' },
    { path: '/user',      label: 'Profile',   icon: '👤' },
  ];

  private loadUserFromStorage(): void {
    try {
      const raw = localStorage.getItem('edumetrics_user');
      if (raw) {
        const u = JSON.parse(raw);
        this.userName   = u.name   || '';
        this.userRole   = u.role   || '';
        this.userAvatar = u.avatar || '';
      }
    } catch { /* ignore */ }
  }

  private isLoggedIn(): boolean {
    return !!localStorage.getItem('edumetrics_user');
  }

  ngOnInit(): void {
    this.loadUserFromStorage();
    const authRoutes = ['/login', '/signup'];
    this.showNav = this.isLoggedIn() && !authRoutes.includes(this.router.url);

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.loadUserFromStorage();
        this.showNav       = this.isLoggedIn() && !authRoutes.includes(e.url);
        this.mobileMenuOpen = false;
      });
  }

  logout(): void {
    localStorage.removeItem('edumetrics_user');
    this.showNav = false;
    this.router.navigate(['/login']);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}