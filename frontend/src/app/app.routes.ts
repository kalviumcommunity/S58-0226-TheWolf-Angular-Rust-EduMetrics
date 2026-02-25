import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

function isLoggedIn(): boolean {
  try {
    return !!localStorage.getItem('edumetrics_user');
  } catch {
    return false;
  }
}

// Redirects to /login if NOT logged in
export function authGuard(): boolean {
  const router = inject(Router);
  if (isLoggedIn()) return true;
  router.navigate(['/login']);
  return false;
}

// Redirects to /dashboard if ALREADY logged in
export function guestGuard(): boolean {
  const router = inject(Router);
  if (!isLoggedIn()) return true;
  router.navigate(['/dashboard']);
  return false;
}

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./components/auth/signup/signup.component').then(m => m.SignupComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/student-dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'students',
    loadComponent: () =>
      import('./components/student-list/student-list.component').then(m => m.StudentListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'counter',
    loadComponent: () =>
      import('./components/counter-demo/counter-demo.component').then(m => m.CounterDemoComponent),
    canActivate: [authGuard]
  },
  {
    path: 'product',
    loadComponent: () =>
      import('./components/product-tile/product-tile.component').then(m => m.ProductTileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'user',
    loadComponent: () =>
      import('./components/user-card/user-card.component').then(m => m.UserCardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'services',
    loadComponent: () =>
      import('./components/service-demo/service-demo.component').then(m => m.ServiceDemoComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'login' }
];