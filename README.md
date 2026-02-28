ASTU Smart Complaint and Issue Tracking System
Developed by: SURA ABRAHAM
Project Overview
The ASTU Smart Complaint System is a professional full-stack platform I engineered to solve the critical problem of campus maintenance at Adama Science and Technology University. I developed this system to replace slow, paper-based reporting with a high-speed digital workflow that ensures transparency and accountability.
This project ensures that every student voice is heard and every campus issue—ranging from dormitory maintenance to internet connectivity—is tracked digitally until it is successfully resolved by university staff.
Technical Features I Implemented
1. Advanced Triple Authentication
To provide maximum accessibility, I built a secure unified login system supporting three distinct methods:
Real Google OAuth 2.0 Integration for one-click student access.
Professional GitHub Sign-On integration for developer-level security.
Secure Manual Registration using Bcrypt military-grade password encryption.
2. Smart Ticket Management
Students can submit detailed complaints including photo evidence for faster identification.
I implemented custom hexadecimal logic to generate unique 8-character Tracking IDs for every ticket.
Automated categorization for Dormitory, Internet, Classroom, and Laboratory departments.
3. Dual-Channel Notification System
In-App Notifications: A real-time notification engine with a bell icon that alerts students of status updates.
Email Notifications: I integrated Nodemailer to trigger official HTML emails to student inboxes the moment a technician resolves their issue.
4. Administrator and Analytics Dashboard
I designed a high-end management portal for university administrators.
Real-time Analytics: Automated calculation of Resolution Rates, Total Tickets, and Pending Actions.
Workload Distribution: Visual progress indicators that help staff identify which departments need more resources.
Semantic Search: Staff can instantly filter tickets by student name, email, or Tracking ID.
Technology Stack
Frontend Architecture
React.js with Vite: Used for high-speed component rendering and optimized performance.
Tailwind CSS: Implemented for a brilliant, modern, and mobile-responsive user interface.
Lucide-React: Utilized for professional vector iconography.
Backend Architecture
Node.js and Express.js: The core logic for the RESTful API and server management.
MongoDB and Mongoose: Used for scalable, document-based data storage.
JSON Web Tokens (JWT): For maintaining secure, stateless user sessions.
Multer: Managed the handling and storage of student photo uploads.
Nodemailer: The engine used for real-world SMTP email delivery.
Project Structure and Modularization
I organized the project using a professional MVC-style (Model-View-Controller) structure to ensure the code is modular, readable, and easy to scale:
Backend Folder
controllers: Contains the core logic for authentication and ticket processing.
models: Defines the database schemas for users, complaints, and notifications.
routes: Maps the API endpoints and connects them to the controllers.
utils: Helper tools including the automated email notification engine.
uploads: Secure physical storage for student-submitted evidence photos.
Frontend Folder
src/pages: Contains the main application screens (Login, Admin, Dashboard).
src/components: Reusable UI elements like the Notification Bell and Chatbot.
App.jsx: The central router featuring my custom Role-Based Security Guards.
Security and Accountability Logic
Role-Based Access Control (RBAC): I built a security interceptor that detects user roles and prevents unauthorized students from accessing the administrative area.
Data Privacy: Strict session isolation ensures students can only view their own tickets, protecting user privacy across the university.
Data Integrity: Every ticket is mathematically linked to a student profile, providing a permanent audit trail for Adama Science and Technology University administrators.
Setup and Installation Instructions
Clone the repository from my GitHub profile.
Navigate to the backend folder, run npm install, and configure your .env file credentials.
Navigate to the frontend folder and run npm install.
Execute npm run dev in both terminals to launch the full-stack application.
Contact Information
SURA ABRAHAM
Adama Science and Technology University
Email: abrhamsura85@gmail.com
