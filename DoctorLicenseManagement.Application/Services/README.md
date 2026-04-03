Doctor License Management System – Backend API

A production-grade backend system built as part of a technical assessment to manage doctor licenses in a Medical SaaS platform.

This project demonstrates clean architecture, scalable API design, and real-world backend engineering practices using modern technologies.

---

Project Overview

This module enables efficient management of doctor licenses, ensuring:

- Accurate license tracking
- Automatic expiry detection
- Secure and structured API communication
- Scalable and maintainable backend architecture

---

Assessment Objectives Covered

-- Doctor CRUD APIs (Create, Read, Update, Delete)
-- Status management (Active / Suspended / Expired)
-- Automatic expiry logic (based on date)
-- Duplicate license prevention
-- Stored procedure-based data retrieval
-- Search & filter functionality
-- Clean architecture implementation
-- Global exception handling
-- Pagination (bonus feature)
-- JWT Authentication (advanced enhancement)

---

Architecture

This project follows Clean Architecture principles:

DoctorLicenseManagement
│
├── API              - Controllers, Middleware, Config
├── Application      - Services, DTOs, Interfaces
├── Domain           - Core Entities (Business Models)
├── Infrastructure   - Database, Dapper, External Services

Key Principles

- Separation of concerns
- Dependency inversion
- Testable & maintainable code
- Scalable design for real-world applications

---

Tech Stack

Layer| Technology
Backend| .NET 8 Web API
ORM| Dapper
Database| SQL Server
Auth| JWT Authentication
Tools| Postman

---

Key Design Decisions

Dynamic Expiry Logic

Doctor status is not blindly stored — it is calculated dynamically:

CASE 
  WHEN LicenseExpiryDate < GETDATE() THEN 'Expired'
  ELSE Status
END

-- Prevents stale data
-- Ensures real-time accuracy

---

Stored Procedure for Listing

Doctor listing uses a stored procedure:

- Supports search (name / license)
- Supports filter (status)
- Applies expiry logic inside SQL
- Improves performance and encapsulation

---

Soft Delete Strategy

IsDeleted = 1

-- Prevents data loss
-- Maintains audit safety

---

Server-Side Pagination (Bonus)

OFFSET + FETCH

-- Scalable for large datasets
-- Returns totalCount + totalPages

---

Global Exception Handling

Centralized middleware ensures:

{
  "success": false,
  "message": "Error message"
}

-- Consistent API responses
-- Cleaner controllers

---

JWT Authentication

- Secure login system
- Token-based authorization
- Protects API endpoints

---

⚙️ Setup Instructions

1. Clone Repository

git clone https://github.com/your-username/doctor-license-management-app.git
cd doctor-license-management-app

---

2. Database Setup

- Open SQL Server
- Run the provided SQL script
- This will:
  - Create database
  - Create tables
  - Add constraints
  - Insert sample data
  - Create stored procedures

---

3.  Configure JWT

Update "appsettings.json":

"Jwt": {
  "Key": "THIS_IS_A_SECRET_KEY_MINIMUM_32_CHARACTERS",
  "Issuer": "DoctorAPI",
  "Audience": "DoctorAPIUsers"
}

---

4. Run Backend

dotnet build
dotnet run

---

 Authentication

Login

POST /api/auth/login

Request

{
  "email": "admin@test.com",
  "password": "Admin@459"
}

Response

{
  "success": true,
  "token": "JWT_TOKEN"
}

Use token:

Authorization: Bearer <token>

---

API Endpoints

Doctors

Method| Endpoint| Description
GET| /api/doctors| Get all doctors (search, filter, pagination)
GET| /api/doctors/{id}| Get doctor by ID
POST| /api/doctors| Create doctor
PUT| /api/doctors/{id}| Update doctor
PATCH| /api/doctors/{id}/status| Update status
DELETE| /api/doctors/{id}| Soft delete

---

Pagination Example

GET /api/doctors?pageNumber=1&pageSize=5

{
  "success": true,
  "pageNumber": 1,
  "pageSize": 5,
  "totalCount": 20,
  "totalPages": 4,
  "data": [...]
}

---

Summary API

GET /api/doctors/summary

{
  "totalDoctors": 10,
  "activeDoctors": 6,
  "expiredDoctors": 4
}

---

Expired Doctors

GET /api/doctors/expired

---

Testing

Use Postman 

-- Login → Get token
-- Add Bearer Token
-- Test APIs

---

Error Handling

All errors follow a unified structure:

{
  "success": false,
  "message": "Error message"
}

---

Business Rules Implemented

-- License auto-expiry
-- Duplicate license prevention
-- Required field validation
-- Status normalization
-- Soft delete exclusion
-- Expired doctors calculated dynamically

---

Why This Implementation Stands Out

- Clean architecture (industry standard)
- Optimized SQL + stored procedures
- Secure authentication (JWT)
- Scalable pagination design
- Real-world error handling strategy
- Production-ready code structure

---

Author

Priya M D
Full Stack Developer

---

Final Note

This project focuses on:

«“Quality over completion, real-world practices over shortcuts.”»

The implementation is designed to reflect production-level backend engineering standards.

---