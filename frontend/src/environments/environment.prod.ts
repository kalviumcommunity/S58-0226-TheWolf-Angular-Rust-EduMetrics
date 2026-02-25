//frontend/src/environments/environment.prod.ts
// ============================================================
// PRODUCTION ENVIRONMENT CONFIGURATION
// Used when running: ng build --configuration production
// ============================================================
export const environment = {
  // Environment flag
  production: true,
  
  // API Configuration
  // This will be replaced with actual production URL
  apiBaseUrl: 'https://api.edumetrics.com',
  apiVersion: 'v1',
  
  // Feature Flags
  enableDebugMode: false,
  enableLogging: false,
  
  // App Configuration
  appName: 'EduMetrics',
  appVersion: '1.0.0',
  
  // Timeouts
  httpTimeout: 15000,
};