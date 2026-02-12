# 🔧 Neplance Server

Backend API for Neplance - built with Express.js and MongoDB.

---

## 🚀 Setup & Run

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)

### Installation

```bash
cd server

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings (see below)

# Start server
npm start
```

**Access**: http://localhost:3001

---

## 🔧 Environment Setup

Create `.env` file:

```env
# Database
DB_URL=mongodb://localhost:27017/neplance
# OR MongoDB Atlas:
# DB_URL=mongodb+srv://username:password@cluster.mongodb.net/neplance

# Server
PORT=3001

# JWT (generate a secure random string)
JWT_SECRET=your_super_secret_key_minimum_64_characters_long
JWT_EXPIRES_IN=24h
JWT_COOKIE_EXPIRES_IN=1
```

**Generate secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📁 Structure

```
server/
├── controllers/    # Request handlers
├── models/        # MongoDB schemas
├── routes/        # API endpoints
├── utils/         # Helper functions
├── app.js         # Express config
└── server.js      # Entry point
```

---

## 🔐 API Endpoints

### Auth
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user

### Users
- `GET /users/:id` - Get profile
- `PUT /users/:id` - Update profile

### Jobs
- `GET /jobs` - List all jobs
- `POST /jobs` - Create job (auth required)
- `GET /jobs/:id` - Job details

---

## 🛠️ Tech Stack

- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcrypt (password hashing)
- CORS, cookie-parser

---

## 🐛 Troubleshooting

**MongoDB connection failed?**
```bash
# Check if MongoDB is running
brew services list | grep mongodb  # macOS
sudo systemctl status mongod       # Ubuntu
```

**Port already in use?**
```bash
lsof -ti:3001 | xargs kill -9
```

**Module errors?**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Example Request

**Register:**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "passwordConfirm": "SecurePass123!",
    "role": ["freelancer"]
  }'
```

---

Need help? Check the [main README](../README.md)
