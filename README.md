# 💬 SyncSphere

A real-time one-on-one chat messaging web application built with the MERN stack and Socket.io.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, React Router v7, Zustand, Axios, Socket.io-client |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Real-time | Socket.io |
| Auth | JWT, bcryptjs |

---

## Features

- **User Authentication** — Register and log in with email and password. Passwords are hashed with bcrypt. Sessions are managed via JWT stored in localStorage.
- **User Search** — Search for any registered user by name or email to start a new conversation.
- **One-on-One Messaging** — Send and receive messages in real time. Chat history is persisted in MongoDB and restored on page refresh.
- **Conversation Sidebar** — Lists all conversations with the other participant's name, last message preview, and timestamp.
- **Real-Time Delivery** — Messages appear instantly in the recipient's window via Socket.io without any page refresh.
- **Typing Indicator** — A `• • • Name is typing` indicator appears when the other user is typing, both in the chat window and in the sidebar.
- **Unread Badges** — Conversations with unread messages show a count badge on the sidebar.

---

## Project Structure

```
sync-sphere/
├── client/                  # React frontend
│   ├── public/
│   └── src/
│       ├── api/
│       │   └── axiosInstance.js      # Axios with auto JWT header
│       ├── components/
│       │   ├── ChatWindow.jsx        # Main message view and input
│       │   ├── MessageBubble.jsx     # Sent/received bubble component
│       │   ├── Sidebar.jsx           # Conversation list and nav
│       │   └── UserSearch.jsx        # Search modal for starting chats
│       ├── pages/
│       │   ├── AuthPage.jsx          # Combined login/register with tab toggle
│       │   └── ChatPage.jsx          # Main chat layout with socket setup
│       ├── socket/
│       │   └── socket.js             # Socket.io singleton
│       └── store/
│           ├── useAuthStore.js       # Zustand auth state
│           └── useChatStore.js       # Zustand conversations/messages state
├── server/                  # Express backend
│   ├── config/
│   │   └── db.js                     # Mongoose connection
│   ├── middleware/
│   │   └── authMiddleware.js         # JWT protect middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Conversation.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── authRoutes.js             # POST /api/auth/register|login
│   │   ├── userRoutes.js             # GET  /api/users/search
│   │   ├── conversationRoutes.js     # GET|POST /api/conversations
│   │   └── messageRoutes.js          # GET|POST /api/messages
│   └── index.js                      # Express app + Socket.io server
├── .env
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- A MongoDB cluster (MongoDB Atlas or local)

### 1. Clone & install

```bash
git clone https://github.com/your-username/sync-sphere.git
cd sync-sphere
npm install
cd client && npm install
```

### 2. Configure environment variables

Create a `.env` file in the root of the project:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

> **Note:** If your MongoDB password contains special characters (e.g. `!`, `@`, `#`), percent-encode them in the URI. For example `!` → `%21`.

### 3. Run the app

Open two terminals from the project root:

**Terminal 1 — API server (port 5000):**
```bash
npm run server
```

**Terminal 2 — React dev server (port 3000):**
```bash
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Reference

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive a JWT |

### Users

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/search?query=` | Search users by name or email |

### Conversations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/conversations` | Get all conversations for the logged-in user |
| POST | `/api/conversations` | Start or open a one-on-one conversation |

### Messages

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/messages/:conversationId` | Get all messages for a conversation |
| POST | `/api/messages` | Send a new message |

---

## Socket.io Events

| Event | Direction | Payload | Description |
|---|---|---|---|
| `setup` | Client → Server | `userId` | Registers user to their personal room |
| `join conversation` | Client → Server | `conversationId` | Joins a conversation room |
| `leave conversation` | Client → Server | `conversationId` | Leaves a conversation room |
| `new message` | Client → Server | message object | Broadcasts a message to the room |
| `message received` | Server → Client | message object | Delivers a new message to recipients |
| `typing` | Client → Server | `{ conversationId, senderName }` | Notifies others that user is typing |
| `stop typing` | Client → Server | `{ conversationId }` | Clears the typing indicator |

---

## Environment Variables

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key used to sign JWT tokens |
| `PORT` | Port the Express server listens on (default: `5000`) |
