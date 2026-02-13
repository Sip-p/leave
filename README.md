# E-Leave – Employee Leave Management System

A full-stack leave management platform for employees and managers.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, React Router, Framer Motion, Lucide Icons, React Hot Toast
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Auth:** JWT, bcrypt

## Features

### Employee
- Apply for leave (Casual, Sick, Earned, WFH)
- View leave balance (Casual, Sick, Earned)
- Track leave requests (Pending, Approved, Rejected)
- Cancel pending leave requests
- Dashboard stats

### Manager
- Approve or reject leave requests
- Add rejection reason/comment
- View team leave schedule (approved leaves)
- View all team member leave balances
- Team leave history with filters (status, type)
- Dashboard stats (pending count, team size, approved this month)

## Setup

### Prerequisites
- Node.js 18+
- MongoDB

### Backend
```bash
cd server
npm install
cp .env.example .env   # Create .env with MONGOURI, JWT_SECRET, PORT
npm start
```

### Frontend
```bash
cd client
npm install
npm run dev
```

### Environment Variables (server/.env)
```
MONGOURI=mongodb://localhost:27017/eleave
JWT_SECRET=your-secret-key
PORT=3000
```

### Frontend (optional)
Create `client/.env` if API runs on different URL:
```
VITE_API_URL=http://localhost:3000/api
```

## Default Ports
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`
