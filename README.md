# Cosmic Watch Backend API

Scalable, secure, API-first backend for real-time Near-Earth Object (NEO) tracking.

## Tech Stack
- **Node.js & Express.js**
- **MongoDB (Mongoose)**
- **Socket.io** (Real-time updates)
- **node-cron** (Scheduled alerts)
- **JWT & bcryptjs** (Security)
- **Docker & Docker Compose**

## Setup Instructions

### Prerequisites
- Docker & Docker Compose
- Node.js (for local development)

### One-Command Startup
```bash
docker-compose up --build
```

### Local Development
1. Navigate to `/backend`
2. Install dependencies: `npm install`
3. Create a `.env` file (see `.env.example` or implementation plan)
4. Start the server: `npm run dev`

## API Endpoints

### Auth
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Authenticate and get JWT

### Asteroids
- `GET /api/neo/feed` - Get asteroid feed (params: `startDate`, `endDate`)
- `GET /api/neo/:id` - Get specific asteroid details
- `POST /api/neo/refresh` - Force refresh of current data from NASA

### Watchlist (Protected)
- `GET /api/watchlist` - Get user's watched asteroids
- `POST /api/watchlist` - Add asteroid to watchlist
- `DELETE /api/watchlist/:id` - Remove from watchlist

### Alerts (Protected)
- `GET /api/alerts` - Get user notifications
- `PUT /api/alerts/:id/read` - Mark alert as read

## Real-Time Features
- **Alerts**: Live notifications via Socket.io
- **Chat**: Asteroid-specific chat rooms for community discussion

## Risk Analysis Engine
Asteroids are scored (0-100) based on:
- Hazardous status
- Diameter
- Relative velocity
- Miss distance
