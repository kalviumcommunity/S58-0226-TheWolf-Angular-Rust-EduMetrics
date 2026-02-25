//frontend/src/environments/environment.ts
// ============================================================
// DEVELOPMENT ENVIRONMENT CONFIGURATION
// Used when running: ng serve
// ============================================================
export const environment = {
  // Environment flag
  production: false,
  
  // API Configuration
  apiBaseUrl: 'http://localhost:8080',
  apiVersion: 'v1',
  
  // Feature Flags
  enableDebugMode: true,
  enableLogging: true,
  
  // App Configuration
  appName: 'EduMetrics - Dev',
  appVersion: '1.0.0',
  
  // Timeouts
  httpTimeout: 30000,
};