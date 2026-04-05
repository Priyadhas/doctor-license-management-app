 Doctor License Management System – Backend API

A production-ready backend system built using .NET 8 Web API following Clean Architecture, designed to manage doctor licenses in a Medical SaaS platform.

---

✨ Features

-  Authentication (JWT-based)
-  Secure password hashing
-  Doctor License Management (CRUD)
-  Dashboard summary API
-  Activity tracking
-  Business rules enforcement
-  Validation & error handling
-  Clean Architecture implementation
-  Stored procedures for optimized queries

---

 Tech Stack

- Framework: .NET 8 Web API
- Architecture: Clean Architecture
- Database: SQL Server
- ORM: Dapper
- Authentication: JWT
- Email Service: SMTP
- API Testing: Swagger / Postman

---

 Architecture

DoctorLicenseManagement/
 ├── API
 ├── Application
 ├── Infrastructure
 ├── Domain

---

 Database Design

Doctor Fields

- Id
- Full Name
- Email
- Specialization
- License Number
- License Expiry Date
- Status
- Created Date

---

 Business Rules

-  Auto mark expired licenses
-  Prevent duplicate license numbers
-  Search by name/license
-  Filter by status
-  Validation enforced at API level

---

 Stored Procedures

- Doctor listing with:
  - Status calculation (Active / Expired)
  - Search support
  - Filter support

---

 Setup Instructions

1 Clone Repository

git clone <your-repo-url>
cd DoctorLicenseManagement.API

2 Configure Database

Update "appsettings.json":

"ConnectionStrings": {
  "DefaultConnection": "your-sql-server-connection"
}

3 Run Application

dotnet run

API runs on:
 http://localhost:5278

---

 Authentication

- JWT-based authentication
- Token required for protected endpoints

---

API Endpoints

Auth

- POST "/api/auth/login"
- POST "/api/auth/register"
- POST "/api/auth/forgot-password"
- POST "/api/auth/reset-password"

Doctors

- GET "/api/doctors"
- GET "/api/doctors/{id}"
- POST "/api/doctors"
- PUT "/api/doctors/{id}"
- DELETE "/api/doctors/{id}"

---

 Key Decisions

- Used Clean Architecture for maintainability
- Used Dapper for performance
- Implemented stored procedures for complex queries
- Centralized error handling
- Secure password hashing

---

 Future Improvements

- Role-based authorization
- Logging (Serilog)
- Unit & integration tests
- Docker support

---

 Author

Priya Maria Dhas

---

 Note

This project demonstrates production-grade backend development aligned with real-world SaaS systems.