Doctor License Management System – Frontend

A modern, scalable frontend application built using Next.js (App Router) and Tailwind CSS, designed to manage doctor licenses in a Medical SaaS platform.

---

  Features

-  Authentication (Login, Register, Forgot & Reset Password)
-  Dashboard with real-time statistics
-  Doctor Management (CRUD operations)
-  Search by name or license number
-  Filter by license status (Active / Expired / Suspended)
-  Dynamic status badges
-  Pagination support
-  Premium Glass UI with smooth animations
-  Toast notifications for better UX
-  Smart validation (password strength, form validation)
-  Loading states & empty states

---

 Tech Stack

- Framework: Next.js (App Router)
- Styling: Tailwind CSS
- State Management: React Query (TanStack)
- Icons: Lucide React
- Validation: Zod
- API Integration: Fetch API

---

Project Structure

src/
 ├── app/
 ├── components/
 ├── layout/
 ├── services/
 ├── utils/

---

 Setup Instructions

1 Clone Repository

git clone 
cd doctor-frontend

2 Install Dependencies

npm install

3 Configure Environment

Create ".env.local":

NEXT_PUBLIC_API_URL=http://localhost:5278/api

4 Run Application

npm run dev

App runs on:
 http://localhost:3000

---

 API Integration

The frontend communicates with backend APIs:

- "/auth/login"
- "/auth/register"
- "/auth/forgot-password"
- "/auth/reset-password"
- "/doctors"
- "/doctors/summary"
- "/doctors/activity"

---

 UI Highlights

- Glassmorphism design (modern SaaS look)
- Smooth transitions & micro-interactions
- Responsive layout
- Clean and reusable components

---

 Key Decisions

- Used React Query for caching and API state
- Built reusable components for scalability
- Implemented client-side validation before API calls
- Used toast notifications instead of alerts for premium UX

---

 Future Improvements

- Role-based UI (Admin / User)
- Dark mode support
- Real-time notifications
- Accessibility improvements

---

 Author

Priya Maria Dhas

---

 Note

This project is part of a technical assessment demonstrating real-world SaaS frontend development practices.

### Screenshots of UI

# Login Page
![alt text](image-1.png)

# Signup Page
![alt text](image-2.png)

# Forget password
![alt text](image-3.png)

# Dashboard
![alt text](image-4.png)

# Doctors License Management Page
![alt text](image-5.png)

![alt text](image-6.png)

![alt text](image-7.png)