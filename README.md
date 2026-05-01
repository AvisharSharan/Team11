# SyncSphere - Team 11

## Project Description

**SyncSphere** is a web-based real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js). It provides instant one-on-one messaging between users with a modern, responsive interface and real-time event updates via Socket.io.

This particular deployment for **Team 11** includes an additional **Team Management** feature that allows team members to create and manage team member profiles with rich information including skills, certifications, and project involvement.

### Core Functionality:
- **Real-time Messaging**: Instant one-on-one chat with typing indicators and persistent conversation history
- **User Search**: Find and connect with other users to start conversations
- **Team Management** (Team 11 specific): Create, view, and organize team member profiles with images and detailed information

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React | 19.2.4 |
| Frontend | React Router DOM | 7.13.1 |
| State Management | Zustand | 5.0.11 |
| HTTP Client | Axios | 1.13.6 |
| Real-time | Socket.io Client | 4.8.3 |
| Backend | Node.js + Express | 5.2.1 |
| Database | MongoDB | 7.1.0 |
| ODM | Mongoose | 9.2.3 |
| Authentication | JWT (jsonwebtoken) | 9.0.3 |
| Passwords | bcryptjs | 3.0.3 |
| File Upload | Multer | 2.1.1 |
| Real-time Server | Socket.io | 4.8.3 |

## Key Features

- **Secure Authentication**: User registration and login with JWT-based session management and bcryptjs password hashing
- **Real-time Messaging**: One-on-one chat with live typing indicators and persistent conversation history
- **User Search**: Find other users to start conversations
- **Responsive Design**: Mobile-friendly UI that works on all screen sizes
- **Team Management** (Optional): Add-on feature for team member profile management with images and detailed information
- **Member CRUD**: Create, read, update, and delete team member records (Team 11 feature)
- **Local File Storage**: Profile images stored securely in the /uploads directory

## Frontend Routes

| Route | Purpose | Auth Required | Feature |
|---|---|---|---|
| `/login` | User login page | No | Core |
| `/register` | User registration page | No | Core |
| `/chat` | Main chat interface | Yes | Core |
| `/team-management` | Team member management hub | Yes | Team 11 |
| `/add-member` | Add new team member form | Yes | Team 11 |
| `/members` | List all team members | Yes | Team 11 |
| `/members/:memberId` | View single member profile | Yes | Team 11 |

## Member Fields

Members can store the following data:

- name
- email
- rollNo
- role
- year
- degree
- aboutProject
- hobbies
- certificate
- internship
- aboutAim
- profileImage
- teamName

## API Reference

### Core SyncSphere Endpoints

#### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user account | No |
| POST | `/api/auth/login` | Login with email/password | No |

**Example - Register**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

#### User Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/users/search?query={text}` | Search users for chat conversations | Yes |

**Example**:
```bash
curl http://localhost:5000/api/users/search?query=john \
  -H "Authorization: Bearer {your_jwt_token}"
```

#### Conversation Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/conversations` | Get all conversations for logged-in user | Yes |
| POST | `/api/conversations` | Create or open a conversation | Yes |

#### Message Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/messages/:conversationId` | Get all messages in a conversation | Yes |
| POST | `/api/messages` | Send a new message | Yes |

### Team 11 - Team Management Endpoints

#### Member Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/members` | List all team members | Yes |
| GET | `/api/members/:id` | Get single member details by ID | Yes |
| POST | `/api/members` | Create new member (with profile image) | Yes |
| DELETE | `/api/members/:id` | Delete member by ID | Yes |

**Example - Create Member**:
```bash
# Using FormData for multipart/form-data with image upload
curl -X POST http://localhost:5000/api/members \
  -H "Authorization: Bearer {your_jwt_token}" \
  -F "name=John Doe" \
  -F "rollNo=T1001" \
  -F "year=3" \
  -F "degree=B.Tech" \
  -F "profileImage=@/path/to/image.jpg"
```

**Example - List Members** (can be tested in browser):
```
http://localhost:5000/api/members
```

#### Upload Endpoint (Team 11)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/upload` | Generic file upload endpoint | Yes |

## Project Structure

```
Team11/
├── client/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── pages/
│       ├── socket/
│       ├── store/
│       └── styles/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   └── utils/
├── package.json
└── README.md
```

## Setup

### Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **MongoDB** - Either:
  - Local MongoDB instance ([Download](https://www.mongodb.com/try/download/community))
  - MongoDB Atlas cloud database ([Create free account](https://www.mongodb.com/cloud/atlas))
- **Git** - For cloning the repository

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AvisharSharan/Team11.git
   cd Team11
   ```

2. **Install root dependencies**:
   ```bash
   npm install
   ```

3. **Install client dependencies**:
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Create .env file** in the project root:
   ```bash
   touch .env
   ```

5. **Configure environment variables** - Add these to your `.env` file:
   ```env
   # MongoDB Connection
   MONGO_URI=mongodb://localhost:27017/syncSphere
   # Or use MongoDB Atlas:
   # MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/syncSphere

   # JWT Secret (use a strong random string)
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Client URL (for CORS and Socket.io)
   CLIENT_URL=http://localhost:3000
   CLIENT_URLS=http://localhost:3000

   # Frontend build variables
   REACT_APP_API_BASE_URL=http://localhost:5000
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

   **Environment Variables Explained**:
   - `MONGO_URI`: Connection string to your MongoDB instance
   - `JWT_SECRET`: Secret key for signing JWT tokens (change this to a strong random string)
   - `PORT`: Backend server port (default 5000)
   - `NODE_ENV`: Environment mode (development/production)
   - `CLIENT_URL` / `CLIENT_URLS`: Frontend URL allowlist for cross-origin requests and Socket.io connections
   - `REACT_APP_API_BASE_URL`: Backend URL used by the React app; the app automatically adds `/api` if omitted
   - `REACT_APP_SOCKET_URL`: Backend URL used by Socket.io

### Vercel + Render Deployment

Set these environment variables before deploying:

- Render backend: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, and `CLIENT_URLS=https://your-vercel-app.vercel.app`
- Vercel frontend: `REACT_APP_API_BASE_URL=https://your-render-service.onrender.com` and `REACT_APP_SOCKET_URL=https://your-render-service.onrender.com`

After changing any `REACT_APP_*` variable in Vercel, redeploy the frontend. Create React App embeds those values at build time.

### How to Run the App

The application requires both backend and frontend servers running simultaneously.

**Option 1: Two Terminal Windows** (Recommended for development)

Terminal 1 - Start Backend Server:
```bash
npm run server
```
Backend will start on `http://localhost:5000`

Terminal 2 - Start Frontend Development Server:
```bash
npm start
```
Frontend will open automatically at `http://localhost:3000`

**Option 2: Concurrently (if configured)**

From root directory:
```bash
npm start
```
This runs both servers if concurrently is configured in root package.json

**Access the Application**:
- **Frontend**: http://localhost:3000
- **API Base URL**: http://localhost:5000
- **Member List**: http://localhost:3000/members
- **Chat**: http://localhost:3000/chat
- **Test API**: http://localhost:5000/api/members (in browser)

## Important Notes

### About This Deployment

This is a SyncSphere instance deployed for Team 11. In addition to the core chat functionality, this deployment includes a **Team Management** module that provides team member profile management capabilities.

**Core Chat Features** (all users):
- User registration, login, and search
- One-on-one real-time messaging
- Conversation history
- Typing indicators

**Team Management** (Team 11 specific add-on):
- Member profile creation and display
- Rich member information storage
- Member image uploads

### Team Member Profiles

Team member profiles (Team 11 feature) support the following fields:

- **Basic Info**: name, email, rollNo, role, year, degree
- **Professional**: certificate, internship, aboutProject
- **Personal**: hobbies, aboutAim
- **Media**: profileImage (required for creation)
- **System**: teamName (default: "Team 11"), timestamps (createdAt, updatedAt)

All fields except `name`, `rollNo`, and `profileImage` are optional.

### File Storage

- Profile images are stored locally in `/server/uploads/`
- Images are served when accessing member details through the API
- Ensure the uploads folder has write permissions
- For production, consider using cloud storage (S3, Azure Blob, etc.)

### Authentication

- All protected routes require a valid JWT token in the Authorization header
- Token is automatically added by the Axios interceptor on the frontend
- Tokens expire after a configurable time period (see backend JWT middleware)
- JWT secret should be changed in production to a strong random string

### Database

- MongoDB connection string in `.env` determines whether you use local or cloud MongoDB
- For local development, ensure MongoDB service is running: `mongod` or use MongoDB Compass
- Database will be created automatically when the first connection is made

## Troubleshooting

### Issue: "Cannot find module" or dependency errors

**Solution**: 
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For client:
cd client
rm -rf node_modules package-lock.json
npm install
cd ..
```

### Issue: MongoDB connection refused

**Solution**:
- Verify MongoDB is running locally: `mongosh` or check MongoDB Compass
- Or update `MONGO_URI` in `.env` to use MongoDB Atlas cloud
- Ensure correct username/password for MongoDB Atlas if using cloud

### Issue: CORS errors or Socket.io connection fails

**Solution**:
- Verify `CLIENT_URL` in `.env` matches your frontend URL (http://localhost:3000 for local dev)
- Check that both frontend and backend are running
- Clear browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: Member creation fails with image upload

**Solution**:
- Ensure `/server/uploads/` folder exists and is writable
- Check that Multer middleware is configured correctly in `server/middleware/upload.js`
- Verify file size is within limits (typically 5-10MB)
- Use a valid image format (JPG, PNG, GIF, WebP)

### Issue: Cannot login after registration

**Solution**:
- Clear local storage and authentication cookies
- Ensure JWT_SECRET is set correctly in `.env`
- Verify user was created in MongoDB by checking the users collection
- Check backend server logs for detailed error messages

## Project Structure

```
Team11/
├── client/
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── src/
│   │   ├── api/           # Axios API client functions
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components for routes
│   │   ├── socket/        # Socket.io client setup
│   │   ├── store/         # Zustand state management stores
│   │   ├── styles/        # CSS files for pages/components
│   │   ├── App.js         # Main app component with routing
│   │   ├── index.js       # React entry point
│   │   └── setupTests.js  # Test configuration
│   └── package.json
│
├── server/
│   ├── config/            # Database and configuration files
│   ├── controllers/       # Route handler logic
│   ├── middleware/        # Custom middleware (auth, upload, etc.)
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express route definitions
│   ├── uploads/           # Local storage for uploaded files
│   ├── utils/             # Utility functions (email, etc.)
│   ├── index.js           # Express server entry point
│   └── package.json
│
├── .env                   # Environment variables (not in git)
├── .gitignore
├── package.json           # Root package.json (for running both client/server)
└── README.md              # This file
```

## Socket.io Events

The real-time chat uses Socket.io for live updates. Key events include:

- **`connect`**: Establish connection to WebSocket server
- **`messageReceived`**: New message received in real-time
- **`typingIndicator`**: User is typing notification
- **`disconnect`**: WebSocket connection closed

Events are configured in [client/src/socket/socket.js](client/src/socket/socket.js)

## Getting Help

- Check the troubleshooting section above
- Review server logs: Run backend with verbose logging
- Check browser console for client-side errors (F12 → Console tab)
- Verify all environment variables are set correctly in `.env`
- Ensure all dependencies are installed: `npm install` in both root and client/
