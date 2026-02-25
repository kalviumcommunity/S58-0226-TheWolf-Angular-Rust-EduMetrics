import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private router = inject(Router);

  email        = '';
  password     = '';
  errorMsg     = '';
  loading      = false;
  showPassword = false;

  constructor() {
    // Seed demo user on load
    try {
      const raw   = localStorage.getItem('edumetrics_users');
      const users = raw ? JSON.parse(raw) : {};
      if (!users['demo@edumetrics.com']) {
        users['demo@edumetrics.com'] = {
          id: 'demo', name: 'Demo User', email: 'demo@edumetrics.com',
          role: 'Administrator',
          avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=c9a84c&color=0d0f14',
          password: 'demo123'
        };
        localStorage.setItem('edumetrics_users', JSON.stringify(users));
      }
    } catch { /* ignore */ }
  }

  togglePassword(): void { this.showPassword = !this.showPassword; }

  fillDemo(): void {
    this.email    = 'demo@edumetrics.com';
    this.password = 'demo123';
    this.errorMsg = '';
  }

  onSubmit(): void {
    this.errorMsg = '';
    if (!this.email.trim()) { this.errorMsg = 'Email is required.';    return; }
    if (!this.password)     { this.errorMsg = 'Password is required.'; return; }

    try {
      const raw   = localStorage.getItem('edumetrics_users');
      const users = raw ? JSON.parse(raw) : {};
      const user  = users[this.email.trim().toLowerCase()];

      if (!user) {
        this.errorMsg = 'No account found. Use demo credentials or sign up.';
        return;
      }
      if (user.password !== this.password) {
        this.errorMsg = 'Incorrect password. Try: demo123';
        return;
      }

      // Save logged-in user (without password)
      const { password, ...authUser } = user;
      localStorage.setItem('edumetrics_user', JSON.stringify(authUser));

      // Navigate immediately - no setTimeout
      this.router.navigate(['/dashboard']);

    } catch (e) {
      this.errorMsg = 'Login error. Please try again.';
    }
  }
}