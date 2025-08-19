const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger.config');
const { generateInitialFleet, simulateMovement, updateVehicleStatus, VEHICLE_STATUSES } = require('./data/mockData');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static WebSocket test page
app.get('/websocket-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'websocket-test.html'));
});

// Serve static files (fallback for any HTML/CSS/JS files)
app.use(express.static(__dirname));

// Swagger UI Documentation - Available at /docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Fleet Tracking API',
  swaggerOptions: {
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    tryItOutEnabled: true,
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
    requestInterceptor: (req) => {
      req.headers['Accept'] = 'application/json';
      return req;
    }
  }
}));

// API specification JSON
app.get('/api-spec.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Root redirect to API documentation
app.get('/', (req, res) => {
  res.redirect('/docs');
});

// Initialize fleet data
let vehicles = generateInitialFleet();

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Set();

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log(`New WebSocket client connected. Total clients: ${clients.size + 1}`);
  clients.add(ws);
  
  // Send initial vehicle data to newly connected client
  try {
    ws.send(JSON.stringify({
      type: 'initial_data',
      data: vehicles,
      timestamp: new Date().toISOString(),
      message: 'Connected to Fleet Tracking WebSocket. Updates every 3 minutes.'
    }));
    console.log('Sent initial vehicle data to new client');
  } catch (error) {
    console.error('Error sending initial data:', error);
    clients.delete(ws);
  }
  
  // Send a ping every 30 seconds to keep connection alive
  const pingInterval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.ping();
    } else {
      clearInterval(pingInterval);
    }
  }, 30000);
  
  // Handle incoming messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      if (message.type === 'ping') {
        // Respond to client ping with pong
        ws.send(JSON.stringify({
          type: 'pong',
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error) {
      // Ignore invalid JSON messages
      console.log('Received non-JSON message, ignoring...');
    }
  });
  
  ws.on('close', (code, reason) => {
    console.log(`WebSocket client disconnected (${code}: ${reason || 'No reason'}). Remaining clients: ${clients.size - 1}`);
    clients.delete(ws);
    clearInterval(pingInterval);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
    clearInterval(pingInterval);
  });
  
  ws.on('pong', () => {
    // Client responded to ping - connection is alive
    console.log('Received pong from client - connection healthy');
  });
});

// Broadcast updates to all connected clients
function broadcastUpdate(data) {
  if (clients.size === 0) {
    console.log('No WebSocket clients connected - skipping broadcast');
    return;
  }

  const message = JSON.stringify({
    type: 'vehicle_update',
    data: data,
    timestamp: new Date().toISOString(),
    message: 'Vehicle positions updated automatically'
  });
  
  let successCount = 0;
  let failureCount = 0;
  
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
        successCount++;
      } catch (error) {
        console.error('Error sending update to client:', error);
        clients.delete(client);
        failureCount++;
      }
    } else {
      // Remove inactive clients
      clients.delete(client);
      failureCount++;
    }
  });
  
  console.log(`Broadcast complete: ${successCount} successful, ${failureCount} failed/removed`);
}

// REST API Routes

// Get all vehicles
app.get('/api/vehicles', (req, res) => {
  try {
    const { status, limit } = req.query;
    
    let filteredVehicles = vehicles;
    
    // Filter by status if provided
    if (status && Object.values(VEHICLE_STATUSES).includes(status)) {
      filteredVehicles = vehicles.filter(vehicle => vehicle.status === status);
    }
    
    // Limit results if specified
    if (limit && !isNaN(parseInt(limit))) {
      filteredVehicles = filteredVehicles.slice(0, parseInt(limit));
    }
    
    res.json({
      success: true,
      data: filteredVehicles,
      total: filteredVehicles.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get vehicle by ID
app.get('/api/vehicles/:id', (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = vehicles.find(v => v.id === id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found',
        message: `Vehicle with ID ${id} does not exist`
      });
    }
    
    res.json({
      success: true,
      data: vehicle,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get vehicles by status
app.get('/api/vehicles/status/:status', (req, res) => {
  try {
    const { status } = req.params;
    
    if (!Object.values(VEHICLE_STATUSES).includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
        message: `Status must be one of: ${Object.values(VEHICLE_STATUSES).join(', ')}`
      });
    }
    
    const filteredVehicles = vehicles.filter(vehicle => vehicle.status === status);
    
    res.json({
      success: true,
      data: filteredVehicles,
      total: filteredVehicles.length,
      status: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching vehicles by status:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get vehicle statistics
app.get('/api/statistics', (req, res) => {
  try {
    const stats = {
      total: vehicles.length,
      idle: vehicles.filter(v => v.status === VEHICLE_STATUSES.IDLE).length,
      en_route: vehicles.filter(v => v.status === VEHICLE_STATUSES.EN_ROUTE).length,
      delivered: vehicles.filter(v => v.status === VEHICLE_STATUSES.DELIVERED).length,
      average_speed: Math.round(
        vehicles.reduce((sum, v) => sum + v.speed, 0) / vehicles.length
      ),
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = req.get('host') === 'case-study-26cf.onrender.com' ? 
    'https://case-study-26cf.onrender.com' : 
    `http://localhost:${PORT}`;
  const wsUrl = req.get('host') === 'case-study-26cf.onrender.com' ? 
    'wss://case-study-26cf.onrender.com' : 
    `ws://localhost:${PORT}`;
  
  res.json({
    title: 'Fleet Tracking API',
    version: '1.0.0',
    description: 'API for fleet tracking case study',
    baseUrl: baseUrl,
    endpoints: {
      'GET /api/vehicles': 'Get all vehicles (supports ?status and ?limit query params)',
      'GET /api/vehicles/:id': 'Get vehicle by ID',
      'GET /api/vehicles/status/:status': 'Get vehicles by status (idle, en_route, delivered)',
      'GET /api/statistics': 'Get fleet statistics',
      'GET /api/docs': 'This documentation'
    },
    websocket: {
      url: wsUrl,
      description: 'WebSocket endpoint for real-time vehicle updates',
      events: {
        'initial_data': 'Sent when client first connects',
        'vehicle_update': 'Sent every 3 minutes with updated vehicle positions'
      }
    },
    vehicle_statuses: Object.values(VEHICLE_STATUSES)
  });
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: 'The requested endpoint does not exist',
    documentation: '/api/docs'
  });
});

// Simulate vehicle movement and broadcast updates every 3 minutes
function updateVehiclePositions() {
  console.log('Updating vehicle positions...');
  
  vehicles = vehicles.map(vehicle => {
    // Update vehicle status occasionally
    vehicle = updateVehicleStatus(vehicle);
    // Simulate movement
    vehicle = simulateMovement(vehicle);
    return vehicle;
  });
  
  // Broadcast updates to all connected WebSocket clients
  broadcastUpdate(vehicles);
  
  console.log(`Updated ${vehicles.length} vehicles and broadcasted to ${clients.size} clients`);
}

// Update vehicle positions every 3 minutes (180000 ms)
const updateInterval = setInterval(updateVehiclePositions, 180000);

// For development/testing - also update every 30 seconds if in development mode
let devInterval;
if (process.env.NODE_ENV === 'development') {
  devInterval = setInterval(updateVehiclePositions, 30000);
  console.log('Development mode: Vehicle updates every 30 seconds for testing');
}

// Start first update immediately after server starts
setTimeout(() => {
  console.log('Performing initial vehicle position update...');
  updateVehiclePositions();
}, 5000); // Wait 5 seconds after server start

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  clearInterval(updateInterval);
  if (devInterval) clearInterval(devInterval);
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  clearInterval(updateInterval);
  if (devInterval) clearInterval(devInterval);
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Fleet Tracking API Server running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/docs`);
  console.log(`� API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);

  console.log(`│ � Documentation:   http://localhost:${PORT}/docs               │`);
  console.log(`│ � REST API:        http://localhost:${PORT}/api                │`);




  console.log(`� Total vehicles: ${vehicles.length}`);
  console.log('🔄 Real-time updates via WebSocket every 3 minutes');
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🧪 Development mode: Updates every 30 seconds');
  }

});

module.exports = app;