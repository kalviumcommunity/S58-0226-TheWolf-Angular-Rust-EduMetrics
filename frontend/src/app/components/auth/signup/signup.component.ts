import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  private router = inject(Router);

  name            = '';
  email           = '';
  password        = '';
  confirmPassword = '';
  role            = 'Student';
  errorMsg        = '';
  loading         = false;
  showPassword    = false;

  roles = ['Student', 'Teacher', 'Administrator', 'Advisor'];

  togglePassword(): void { this.showPassword = !this.showPassword; }

  getPasswordStrength(): { level: string; width: string; color: string } {
    const pw = this.password;
    if (!pw) return { level: '', width: '0%', color: '#e5e7eb' };
    let score = 0;
    if (pw.length >= 8)          score++;
    if (/[A-Z]/.test(pw))        score++;
    if (/[0-9]/.test(pw))        score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { level: 'Weak',   width: '25%',  color: '#ef4444' };
    if (score === 2) return { level: 'Fair',   width: '50%',  color: '#f97316' };
    if (score === 3) return { level: 'Good',   width: '75%',  color: '#eab308' };
    return              { level: 'Strong', width: '100%', color: '#22c55e' };
  }

  onSubmit(): void {
    this.errorMsg = '';
    if (!this.name.trim())                      { this.errorMsg = 'Full name is required.'; return; }
    if (!this.email.trim())                     { this.errorMsg = 'Email is required.'; return; }
    if (!this.email.includes('@'))              { this.errorMsg = 'Enter a valid email address.'; return; }
    if (!this.password)                         { this.errorMsg = 'Password is required.'; return; }
    if (this.password.length < 6)               { this.errorMsg = 'Password must be at least 6 characters.'; return; }
    if (this.password !== this.confirmPassword) { this.errorMsg = 'Passwords do not match.'; return; }

    try {
      const raw   = localStorage.getItem('edumetrics_users');
      const users = raw ? JSON.parse(raw) : {};
      const key   = this.email.trim().toLowerCase();

      if (users[key]) {
        this.errorMsg = 'An account with this email already exists.';
        return;
      }

      const newUser = {
        id:       Date.now().toString(),
        name:     this.name.trim(),
        email:    key,
        role:     this.role,
        avatar:   `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name.trim())}&background=0f8a8a&color=fff`,
        password: this.password
      };

      users[key] = newUser;
      localStorage.setItem('edumetrics_users', JSON.stringify(users));

      const { password, ...authUser } = newUser;
      localStorage.setItem('edumetrics_user', JSON.stringify(authUser));

      // Navigate immediately - no setTimeout
      this.router.navigate(['/dashboard']);

    } catch (e) {
      this.errorMsg = 'Signup error. Please try again.';
    }
  }
}