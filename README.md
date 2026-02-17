# EduMetrics - Student Performance Analytics Engine

## Project Overview
Develop a student performance analytics engine that aggregates academic scores, attendance, engagement, and behavioral signals to generate insights, risk indicators, and personalized interventions for faculty and advisors.

---

## 🏗️ Technology Stack
- **Frontend:** Angular 17+
- **Backend:** Rust with Actix-Web
- **Database:** PostgreSQL (coming soon)
- **API Communication:** RESTful JSON APIs

---

## 📂 Angular Project Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── components/          # UI Components
│   │   │   └── student-dashboard/
│   │   │       ├── student-dashboard.component.ts
│   │   │       ├── student-dashboard.component.html
│   │   │       └── student-dashboard.component.css
│   │   ├── services/            # API Communication
│   │   │   └── api.service.ts   # HTTP requests to backend
│   │   ├── models/              # TypeScript interfaces
│   │   ├── guards/              # Route protection
│   │   ├── interceptors/        # HTTP interceptors
│   │   ├── app.component.ts     # Root component
│   │   └── app.config.ts        # App configuration
│   ├── index.html               # Entry HTML
│   └── main.ts                  # Bootstrap application
├── angular.json                 # Angular CLI config
├── package.json                 # npm dependencies
└── tsconfig.json               # TypeScript config
```

### Key Angular Files Explained

| File/Folder | Purpose |
|-------------|---------|
| `src/app/components/` | UI building blocks (each feature gets a component) |
| `src/app/services/` | Business logic & API calls using HttpClient |
| `src/app/models/` | TypeScript interfaces for type safety |
| `app.component.ts` | Root component - entry point for UI |
| `app.config.ts` | Application-wide configuration |
| `package.json` | Lists all npm dependencies (@angular/core, rxjs, etc.) |

---

## 📂 Rust Project Structure
```
backend/
├── src/
│   ├── routes/                  # API Route definitions
│   │   ├── mod.rs              # Routes module export
│   │   └── students.rs         # Student endpoints
│   ├── handlers/                # Request handlers (business logic)
│   │   ├── mod.rs              # Handlers module export
│   │   └── student_handler.rs  # Student CRUD logic
│   ├── models/                  # Data structures
│   │   ├── mod.rs              # Models module export
│   │   └── student.rs          # Student struct & DTOs
│   ├── config/                  # Configuration
│   │   ├── mod.rs              # Config module export
│   │   └── database.rs         # DB connection setup
│   └── main.rs                 # Server entry point
├── Cargo.toml                   # Rust dependencies
└── target/                      # Compiled binaries (ignored by git)
```

### Key Rust Files Explained

| File/Folder | Purpose |
|-------------|---------|
| `src/main.rs` | Server initialization, route registration, HTTP server startup |
| `src/routes/` | Define API endpoints (GET, POST, PUT, DELETE) |
| `src/handlers/` | Business logic - process requests, query DB, return responses |
| `src/models/` | Type-safe data structures (Student, Score, Attendance, etc.) |
| `src/config/` | Environment variables, database config, JWT secrets |
| `Cargo.toml` | Project metadata & dependencies (actix-web, serde, sqlx) |

---

## 🔄 How Angular & Rust Communicate

### Request Flow Example: "Get All Students"
```
1. User clicks "View Students" button
   ↓
2. Component calls service method
   this.apiService.getStudents()
   ↓
3. Service makes HTTP GET request
   HttpClient → GET http://localhost:8080/api/students
   ↓
4. Rust receives request
   Route: /api/students → handler::get_all_students()
   ↓
5. Handler queries database (future implementation)
   SELECT * FROM students
   ↓
6. Handler returns JSON response
   [{id: 1, name: "John", email: "john@edu.com"}, ...]
   ↓
7. Service receives Observable
   Observable<Student[]>
   ↓
8. Component updates UI
   this.students = data;
   ↓
9. Angular renders student list
   *ngFor="let student of students"
```

---

## 🎯 Assignment 3.9: Project Structure Exploration

### Files Modified/Created:

**Angular:**
- ✅ `src/app/services/api.service.ts` - API communication layer
- ✅ `src/app/components/student-dashboard/` - Example UI component
- ✅ Organized folder structure (components, services, models)

**Rust:**
- ✅ `src/models/student.rs` - Student data structures
- ✅ `src/handlers/student_handler.rs` - Business logic
- ✅ `src/routes/students.rs` - API endpoints
- ✅ `src/main.rs` - Updated with modular architecture

---

## 🏃 Running the Application

### Frontend (Angular)
```bash
cd frontend
npm install          # First time only
ng serve
# Open http://localhost:4200
```

### Backend (Rust)
```bash
cd backend
cargo build          # First time only
cargo run
# API available at http://localhost:8080
```

---

## 📸 Screenshots

### Angular Project Structure
![Angular Structure](./screenshots/angular-structure.png)

### Rust Project Structure
![Rust Structure](./screenshots/rust-structure.png)

### Components Folder
![Components](./screenshots/components-folder.png)

### Services Folder
![Services](./screenshots/services-folder.png)

### Rust Handlers
![Handlers](./screenshots/handlers-folder.png)

---

## 🧪 Case Study: Building "Create Product" Feature

### Files to Edit:

**Angular (Frontend):**
1. `src/app/models/product.ts` - Create Product interface
2. `src/app/services/api.service.ts` - Add createProduct() method
3. `src/app/components/product-form/` - New component for form UI
4. `src/app/components/product-form/product-form.component.ts` - Form logic
5. `src/app/components/product-form/product-form.component.html` - Form template

**Rust (Backend):**
1. `src/models/product.rs` - Define Product struct & DTOs
2. `src/handlers/product_handler.rs` - Implement create_product logic
3. `src/routes/products.rs` - Add POST /api/products route
4. `src/main.rs` - Register product routes in App

**Request Flow:**
```
User fills form → Component validates → 
Service posts to /api/products → 
Rust route receives → Handler validates → 
Insert into DB → Return success → 
UI shows confirmation
```

---

## 📚 Key Learnings

### Why This Structure Matters:
- ✅ **Separation of Concerns**: UI (components) ≠ Logic (services) ≠ Data (models)
- ✅ **Scalability**: Each feature gets its own folder/module
- ✅ **Maintainability**: Easy to find and fix bugs
- ✅ **Team Collaboration**: Multiple developers can work without conflicts
- ✅ **Type Safety**: TypeScript + Rust catch errors at compile time


## Assignment 3.23 - Basic Actix Backend with Health Check

### What Was Built
A minimal Rust backend using Actix-Web with three working endpoints that serve as the foundation for the EduMetrics API.

### Why Health Checks Matter
| Use Case | Description |
|----------|-------------|
| Load Balancers | Verify server is alive before routing traffic |
| CI/CD Pipelines | Confirm deployment succeeded |
| Monitoring Tools | Check uptime and availability |
| Frontend Apps | Show backend connection status to users |

### API Endpoints

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/` | Root status message | Plain text |
| GET | `/health` | Health check | JSON with status |
| GET | `/status` | Detailed server status | JSON with endpoints |

### Health Check Response
```json
{
  "status": "OK",
  "message": "Backend is operational",
  "service": "EduMetrics Student Analytics Engine",
  "version": "1.0.0"
}
```

### Server Structure
```
backend/
├── src/
│   └── main.rs          # Server entry point
│       ├── root_status()      # GET /
│       ├── health_check()     # GET /health
│       └── server_status()    # GET /status
└── Cargo.toml           # Dependencies
```

### How to Run Backend
```bash
cd backend
cargo run
# Server starts at http://localhost:8080
# Health check at http://localhost:8080/health
```

### How Frontend Will Use Health Check
```typescript
// Angular service will call health endpoint
checkBackendHealth(): Observable {
  return this.http.get('http://localhost:8080/health');
}
```

### Best Practices Followed
- ✅ Fast response (no heavy logic)
- ✅ Structured JSON responses
- ✅ Consistent endpoint naming
- ✅ Structured startup logging
- ✅ Modular handler functions
- ✅ No external dependencies in health check