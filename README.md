# Fleet Tracking Dashboard API

A REST API with real-time WebSocket updates for fleet tracking case study. This API provides vehicle tracking data, statistics, and real-time updates for building fleet management dashboards.

## 🚀 Live Demo

**API is deployed and ready to use:**
- **Base URL:** https://case-study-26cf.onrender.com
- **API Documentation:** https://case-study-26cf.onrender.com/docs
- **WebSocket URL:** `wss://case-study-26cf.onrender.com`
- **WebSocket Test Page:** https://case-study-26cf.onrender.com/websocket-test

## 📖 API Documentation

Interactive Swagger UI documentation is available at:
https://case-study-26cf.onrender.com/docs

Use the **"Try it out"** button on each endpoint to test the API directly.

## 🔌 WebSocket Connection

Connect to `wss://case-study-26cf.onrender.com` for real-time vehicle updates:

```javascript
const ws = new WebSocket('wss://case-study-26cf.onrender.com');

ws.onopen = () => {
  console.log('Connected to Fleet Tracking WebSocket');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
  
  if (data.type === 'initial_data') {
    // Initial vehicle data when connecting
    console.log('Initial vehicles:', data.data);
  } else if (data.type === 'vehicle_update') {
    // Real-time vehicle position updates (every 3 minutes)
    console.log('Vehicle updates:', data.data);
  }
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

## 🚗 API Endpoints

### Vehicle Management
- `GET /api/vehicles` - Get all vehicles (supports `?status` and `?limit` query params)
- `GET /api/vehicles/:id` - Get specific vehicle by ID
- `GET /api/vehicles/status/:status` - Get vehicles by status (`idle`, `en_route`, `delivered`)

### Analytics
- `GET /api/statistics` - Get fleet statistics and analytics

### Documentation
- `GET /api/docs` - API specification and endpoints overview

## 📊 Sample Data

The API provides 25 mock vehicles with:
- Real-time position simulation
- Status updates (idle, en_route, delivered)
- Driver information
- Battery and fuel levels
- Speed and location tracking

## 🔄 Real-time Updates

- **WebSocket Updates:** Every 3 minutes
- **Connection Management:** Automatic ping/pong keep-alive
- **Event Types:** `initial_data`, `vehicle_update`, `ping`/`pong`

## 🛠️ Local Development

If you want to run locally:

```bash
# Install dependencies
npm install

# Start development server
npm start

# Local URLs:
# API: http://localhost:3001
# Docs: http://localhost:3001/docs
# WebSocket: ws://localhost:3001
```

## 🧪 Testing

### WebSocket Connection Test
- **Browser:** Visit https://case-study-26cf.onrender.com/websocket-test for interactive testing
- **Command Line:** Run `npm run test:websocket` to test connection via Node.js

### API Testing
Use the Swagger UI at https://case-study-26cf.onrender.com/docs to test all endpoints interactively.

## 📦 Technologies

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **WebSocket (ws)** - Real-time communication
- **Swagger UI** - API documentation
- **CORS** - Cross-origin resource sharing

## 🌐 Deployment

This API is optimized for cloud deployment on:
- **Render** (current deployment)
- **Vercel**
- **Railway**
- **Heroku**

## 💡 Usage Examples

### Fetch All Vehicles
```javascript
fetch('https://case-study-26cf.onrender.com/api/vehicles')
  .then(response => response.json())
  .then(data => console.log(data));
```

### Get Vehicles by Status
```javascript
fetch('https://case-study-26cf.onrender.com/api/vehicles/status/en_route')
  .then(response => response.json())
  .then(data => console.log('En route vehicles:', data));
```

### Fleet Statistics
```javascript
fetch('https://case-study-26cf.onrender.com/api/statistics')
  .then(response => response.json())
  .then(stats => console.log('Fleet stats:', stats));
```

## 🎯 Case Study Instructions

Use this API to build a fleet tracking dashboard that demonstrates:

1. **Data Fetching** - Retrieve vehicle and statistics data
2. **Real-time Updates** - Implement WebSocket connection for live updates
3. **User Interface** - Display vehicles on maps, tables, or cards
4. **Filtering/Search** - Filter vehicles by status, search by driver name
5. **Analytics** - Show fleet statistics and metrics

The API is production-ready and provides all necessary endpoints for a comprehensive fleet management solution.

---

**Happy coding! 🚀**
