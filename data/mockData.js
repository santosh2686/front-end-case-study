const { v4: uuidv4 } = require('uuid');

// Mock data for fleet tracking case study
// Using coordinates around San Francisco Bay Area for realistic simulation

const VEHICLE_STATUSES = {
  IDLE: 'idle',
  EN_ROUTE: 'en_route',
  DELIVERED: 'delivered'
};

const DRIVER_NAMES = [
  'John Smith', 'Maria Garcia', 'David Chen', 'Sarah Johnson', 'Michael Brown',
  'Lisa Wang', 'Robert Davis', 'Jennifer Wilson', 'Carlos Rodriguez', 'Emily Taylor',
  'Kevin Lee', 'Amanda Martinez', 'Daniel Thompson', 'Jessica Anderson', 'Chris Wilson',
  'Michelle Kim', 'Steven Jackson', 'Nicole White', 'Ryan Harris', 'Stephanie Clark'
];

const DESTINATIONS = [
  'Downtown Office Building', 'Residential Complex A', 'Shopping Mall West',
  'Industrial District', 'Airport Terminal 1', 'Hospital Center', 'University Campus',
  'Tech Park North', 'Warehouse District', 'Business Center East', 'Retail Plaza',
  'Convention Center', 'Sports Stadium', 'Hotel Downtown', 'Manufacturing Plant',
  'Distribution Center', 'Corporate Headquarters', 'Medical Center', 'Shopping District',
  'Financial District'
];

// Base coordinates around San Francisco Bay Area
const BASE_COORDINATES = {
  lat: 37.7749,
  lng: -122.4194
};

// Generate random coordinates within a reasonable radius
function generateRandomCoordinates() {
  const latOffset = (Math.random() - 0.5) * 0.2; // ~11km radius
  const lngOffset = (Math.random() - 0.5) * 0.2;
  
  return {
    lat: BASE_COORDINATES.lat + latOffset,
    lng: BASE_COORDINATES.lng + lngOffset
  };
}

// Generate random vehicle data
function generateVehicle(index) {
  const statuses = Object.values(VEHICLE_STATUSES);
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const coordinates = generateRandomCoordinates();
  
  return {
    id: uuidv4(),
    vehicleNumber: `FL-${String(index + 1).padStart(3, '0')}`,
    driverName: DRIVER_NAMES[index % DRIVER_NAMES.length],
    driverPhone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    status: status,
    destination: DESTINATIONS[index % DESTINATIONS.length],
    currentLocation: coordinates,
    speed: status === VEHICLE_STATUSES.EN_ROUTE ? Math.floor(Math.random() * 60) + 20 : 0,
    lastUpdated: new Date().toISOString(),
    estimatedArrival: status === VEHICLE_STATUSES.EN_ROUTE ? 
      new Date(Date.now() + Math.floor(Math.random() * 3600000) + 600000).toISOString() : null,
    batteryLevel: Math.floor(Math.random() * 40) + 60,
    fuelLevel: Math.floor(Math.random() * 50) + 30
  };
}

// Generate initial fleet of 25 vehicles
const generateInitialFleet = () => {
  return Array.from({ length: 25 }, (_, index) => generateVehicle(index));
};

// Function to simulate vehicle movement
function simulateMovement(vehicle) {
  if (vehicle.status === VEHICLE_STATUSES.IDLE || vehicle.status === VEHICLE_STATUSES.DELIVERED) {
    // Idle or delivered vehicles don't move much, just slight GPS variations
    const smallMovement = 0.0001; // Very small movement
    vehicle.currentLocation.lat += (Math.random() - 0.5) * smallMovement;
    vehicle.currentLocation.lng += (Math.random() - 0.5) * smallMovement;
    vehicle.speed = 0;
  } else if (vehicle.status === VEHICLE_STATUSES.EN_ROUTE) {
    // En route vehicles move more significantly
    const movement = 0.002; // Larger movement for traveling vehicles
    vehicle.currentLocation.lat += (Math.random() - 0.5) * movement;
    vehicle.currentLocation.lng += (Math.random() - 0.5) * movement;
    vehicle.speed = Math.floor(Math.random() * 60) + 20;
    
    // Occasionally change status to delivered
    if (Math.random() < 0.1) {
      vehicle.status = VEHICLE_STATUSES.DELIVERED;
      vehicle.speed = 0;
      vehicle.estimatedArrival = null;
    }
  }
  
  // Update timestamp
  vehicle.lastUpdated = new Date().toISOString();
  
  // Simulate battery drain
  if (vehicle.batteryLevel > 20) {
    vehicle.batteryLevel -= Math.floor(Math.random() * 2);
  }
  
  return vehicle;
}

// Function to occasionally change vehicle status
function updateVehicleStatus(vehicle) {
  if (Math.random() < 0.05) { // 5% chance to change status
    const statuses = Object.values(VEHICLE_STATUSES);
    const currentIndex = statuses.indexOf(vehicle.status);
    
    switch (vehicle.status) {
      case VEHICLE_STATUSES.IDLE:
        if (Math.random() < 0.7) {
          vehicle.status = VEHICLE_STATUSES.EN_ROUTE;
          vehicle.estimatedArrival = new Date(Date.now() + Math.floor(Math.random() * 3600000) + 600000).toISOString();
        }
        break;
      case VEHICLE_STATUSES.EN_ROUTE:
        if (Math.random() < 0.3) {
          vehicle.status = VEHICLE_STATUSES.DELIVERED;
          vehicle.estimatedArrival = null;
          vehicle.speed = 0;
        }
        break;
      case VEHICLE_STATUSES.DELIVERED:
        if (Math.random() < 0.4) {
          vehicle.status = VEHICLE_STATUSES.IDLE;
          vehicle.destination = DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)];
        }
        break;
    }
  }
  
  return vehicle;
}

module.exports = {
  VEHICLE_STATUSES,
  generateInitialFleet,
  simulateMovement,
  updateVehicleStatus
}; 