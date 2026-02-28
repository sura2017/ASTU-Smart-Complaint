ASTU Smart Complaint and Issue Tracking System
Developed by: SURA ABRAHAM
📝 Project Overview
The ASTU Smart Complaint System is a professional full-stack platform I engineered to solve the critical problem of campus maintenance at Adama Science and Technology University. I developed this system to replace slow, paper-based reporting with a high-speed digital workflow that ensures transparency and accountability.
This project ensures that every student voice is heard and every campus issue—ranging from dormitory maintenance to internet connectivity—is tracked digitally until it is successfully resolved by university staff.
🤖 Integrated AI Chatbot Assistance
I implemented a specialized AI Assistant to provide 24/7 support to students. The chatbot is designed to handle the following:
Status Explanations: Automatically explains what "Open," "In Progress," and "Resolved" mean for a ticket.
Department Routing: Guides students on which department handles specific issues (e.g., Housing Office for Dorms, ICT for WiFi).
Submission Guidance: Instructs students on how to write professional descriptions and why photo evidence is necessary.
Accountability Education: Explains how the system tracks student IDs and timestamps to ensure university staff remain accountable.
🛠 Technical Features I Implemented
1. Advanced Triple Authentication
To provide maximum accessibility, I built a secure unified login system supporting three distinct methods:
Real Google OAuth 2.0 Integration for one-click student access.
Professional GitHub Sign-On integration for developer-level security.
Secure Manual Registration using Bcrypt military-grade password encryption.
2. Smart Ticket Management
Photo Evidence: Students can submit detailed complaints including photo uploads for faster identification.
Tracking IDs: I implemented custom hexadecimal logic to generate unique 8-character Tracking IDs for every ticket.
Automated Categorization: Issues are automatically routed to Dormitory, Internet, Classroom, or Laboratory departments.
3. Dual-Channel Notification System
In-App Notifications: A real-time notification engine with a bell icon that alerts students of status updates.
Email Notifications: I integrated Nodemailer to trigger official HTML emails to student inboxes the moment a technician resolves their issue.
4. Administrator and Analytics Dashboard
Management Portal: A high-end portal designed for university administrators.
Real-time Analytics: Automated calculation of Resolution Rates, Total Tickets, and Pending Actions.
Workload Distribution: Visual progress indicators to help staff identify department needs at a glance.
Semantic Search: Staff can instantly filter tickets by name, email, or Tracking ID.
💻 Technology Stack
Frontend Architecture
React.js with Vite: Used for high-speed component rendering and optimized performance.
Tailwind CSS: Implemented for a brilliant, modern, and mobile-responsive user interface (Samsung/Techno optimized).
Lucide-React: Utilized for professional vector iconography.
Backend Architecture
Node.js and Express.js: The core logic for the RESTful API and server management.
MongoDB and Mongoose: Used for scalable, document-based data storage.
JSON Web Tokens (JWT): For maintaining secure, stateless user sessions.
Multer: Managed the handling and storage of student photo uploads.
Nodemailer: The engine used for real-world SMTP email delivery.
📂 Project Structure
I organized the project using a professional MVC-style structure to ensure the code is modular and readable:
Backend Folder
controllers: Core logic for authentication, ticket processing, and AI responses.
models: Database schemas for users, complaints, and notifications.
routes: API endpoint mapping.
utils: Helper tools like the automated email engine.
uploads: Secure storage for student evidence photos.
Frontend Folder
src/pages: Main application screens (Login, Admin, Dashboard).
src/components: Reusable UI elements like the Notification Bell and AI Chatbot window.
App.jsx: The central router featuring my custom Role-Based Security Guards.
🔒 Security and Accountability Logic
Role-Based Access Control (RBAC): I built a security interceptor that prevents unauthorized students from accessing the admin area.
Data Privacy: Session isolation ensures students only view their own tickets, protecting user privacy across the university.
Integrity: Every ticket is mathematically linked to a student profile, providing a permanent audit trail for ASTU administrators.
⚙️ Setup and Installation
Clone the repository from my GitHub profile.
Navigate to the backend folder, run npm install, and configure your .env file credentials.
Navigate to the frontend folder and run npm install.
Execute npm run dev in both terminals to launch the full-stack application.
Contact Information
SURA ABRAHAM
Adama Science and Technology University
📧 Email: abrhamsura85@gmail.com