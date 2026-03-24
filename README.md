# 🚀 ASIK - Company-Wide Task Management

<p align="center">
  <img src="https://img.shields.io/badge/Stack-React%20%2B%20Node.js-blue?style=for-the-badge&logo=react" alt="Stack">
  <img src="https://img.shields.io/badge/Database-Firebase-orange?style=for-the-badge&logo=firebase" alt="Database">
  <img src="https://img.shields.io/badge/Style-Tailwind%20CSS-blue?style=for-the-badge&logo=tailwind-css" alt="Style">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

---

## ✨ What's ASIK?

**ASIK** (Amazing System for Integrated Knowledge) is a modern, full-stack task management application designed for companies to efficiently manage tasks, teams, and projects. Built with the power of **React**, **Node.js**, **Firebase**, and **Tailwind CSS**, it provides a seamless experience for teams to collaborate and stay productive.

> "ASIK" means "okay" or "alright" in Indonesian — because managing tasks should be simple! 🙌

---

## 🎯 Features

| Feature | Description |
|---------|-------------|
| 📋 **Kanban Board** | Drag-and-drop task management with customizable columns |
| 📅 **Calendar View** | Visualize tasks and events in monthly/weekly/daily views |
| 👥 **Role-Based Access** | Admin, Manager, and Employee roles with proper permissions |
| 🏢 **Departments** | Organize teams into departments for better management |
| 📊 **Dashboard** | Real-time statistics and recent activity tracking |
| 🔐 **Secure Auth** | Google Sign-In powered by Firebase Authentication |

---

## 🛠️ Tech Stack

### Backend
<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

</div>

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Firebase Firestore
- **Auth**: Firebase Admin SDK + JWT
- **Logging**: Winston

### Frontend
<div align="center">

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)

</div>

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **Drag & Drop**: @dnd-kit

---

## 📁 Project Structure

```
asikaso/
├── 📂 backend/               # Express.js API server
│   ├── 🎮 controllers/       # Request handlers
│   ├── 🔒 middleware/        # Auth, RBAC, validation
│   ├── 🛤️ routes/            # API endpoints
│   ├── ⚙️ services/          # Firestore operations
│   ├── 🔥 firebaseAdmin.js   # Firebase Admin setup
│   ├── 🚀 index.js           # Server entry point
│   └── ⚡ .env                # Environment config
│
├── 📂 frontend/              # React application
│   ├── 🧩 src/
│   │   ├── 🧱 components/    # Reusable UI components
│   │   ├── 🎭 contexts/      # React Context (Auth, Theme)
│   │   ├── 📐 layouts/       # Page layouts
│   │   ├── 📄 pages/         # Route pages
│   │   , 🔀 router/          # React Router config
│   │   , 🔌 services/        # API & Firebase services
│   │   , 📝 types/           # TypeScript definitions
│   │   └── 🎨 index.css      # Tailwind styles
│   └── 📦 package.json
│
└── 📖 README.md
```

---

## 🚦 Getting Started

### Prerequisites

| Requirement | Description |
|-------------|-------------|
| Node.js | Version 18 or higher |
| npm | Comes with Node.js |
| Firebase Project | Firestore + Google Auth enabled |

### Quick Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/your-username/asikaso.git
cd asikaso
```

#### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file (see .env.example)
# Add your Firebase service account JSON

npm run dev
# Server runs on http://localhost:3001
```

#### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 🔑 Environment Variables

### Backend (.env)
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

---

## 📊 Firestore Schema

```
📁 users/
   └── {userId} → displayName, email, role, departmentId, isActive

📁 departments/
   └── {deptId} → name, description, createdAt

📁 tasks/
   └── {taskId} → title, description, status, priority, dueDate, assigneeId, departmentId

📁 subtasks/
   └── {subtaskId} → title, completed, taskId

📁 events/
   └── {eventId} → title, description, type, startDate, endDate, status

📁 activity_logs/
   └── {logId} → action, userId, details, timestamp
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. 🍴 **Fork** the repository
2. 🌿 **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. 📤 **Push** to the branch (`git push origin feature/amazing-feature`)
5. 🔃 **Open** a Pull Request

### Ideas for Contributions
- 🎨 Improve the UI/UX design
- 🐛 Fix bugs and issues
- ✨ Add new features (e.g., notifications, file attachments)
- 📚 Improve documentation
- 🧪 Write tests

---

## 📋 API Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/auth/me` | Get current user |
| `GET` | `/api/users` | List all users (Admin) |
| `GET` | `/api/departments` | List departments |
| `GET` | `/api/tasks` | List tasks with filters |
| `POST` | `/api/tasks` | Create new task |
| `PATCH` | `/api/tasks/:id/status` | Update task status |
| `GET` | `/api/events` | List calendar events |
| `POST` | `/api/events` | Create new event |

---

## 🛡️ Security

- ✅ JWT token verification via Firebase Auth
- ✅ Role-based access control (RBAC)
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Security headers via Helmet

---

## 📝 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com/) for the amazing backend services
- [Tailwind CSS](https://tailwindcss.com/) for beautiful styling
- [React](https://react.dev/) community for the best frontend library

---

<div align="center">

### ⭐ Show Your Support!

If you like this project, give it a star on GitHub! 🌟

Built with ❤️ by the ASIK Team

</div>
