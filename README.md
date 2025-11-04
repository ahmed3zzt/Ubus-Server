# 🚌 Ubus Server

Backend for **Ubus**, a smart university transportation system that connects students and bus drivers through a seamless digital platform for seat booking, trip management, and secure payments.

---

## 🚀 Overview
The **Ubus Server** provides all backend functionality for the Ubus ecosystem.  
It’s built using **Node.js (Express)** and supports both **student** and **driver** operations through a RESTful API.

This service handles:
- User authentication & roles (students, drivers, admins)
- Bus route and schedule management
- Seat booking system with real-time availability
- Wallet and payment logic
- QR code verification for boarding
- Notifications & booking status updates
- Admin monitoring and analytics

---

## 🧩 Tech Stack
| Category | Technology |
|-----------|-------------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB (Mongoose ORM) |
| Authentication | JWT (JSON Web Tokens) |
| Documentation | Swagger UI |
| Containerization | Docker & Docker Compose |
| Other | bcrypt, multer, nodemailer, dotenv |

# 🧠 Core Features

User Authentication (Student / Driver / Admin)

Booking Management
Students can view routes, reserve seats, and receive booking confirmations.

QR Code Boarding
Drivers scan QR codes to validate and process payments.

Wallet System
Secure wallet that auto-deducts payment 10 minutes before trip time.

Dynamic Pricing & Discounts
Configurable logic for promotions and loyalty rewards.

Admin Dashboard APIs
For routes, buses, and transaction monitoring.
# 👨‍💻 Author

## Ahmed Ezzat
🚀 Full Stack Developer | Smart Mobility Solutions
GitHub: ahmed3zzt

Portfolio: ahmed-ezz.netlify.app
