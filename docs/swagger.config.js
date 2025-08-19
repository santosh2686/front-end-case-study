const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fleet Tracking Dashboard API',
      version: '1.0.0',
      description: `
**REST API for fleet tracking case study.**

Use the **"Try it out"** button on each endpoint to test the API directly from this documentation.

**Key Features:**
- 25 mock vehicles with real-time simulation
- WebSocket updates every 3 minutes  
- Vehicle status tracking (idle, en_route, delivered)
- Fleet statistics and analytics

**WebSocket:** Connect to \`ws://localhost:3001\` for real-time vehicle updates.
      `,
      contact: {
        name: 'API Support'
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        Vehicle: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique vehicle identifier',
              example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
            },
            vehicleNumber: {
              type: 'string',
              description: 'Vehicle fleet number',
              example: 'FL-001'
            },
            driverName: {
              type: 'string',
              description: 'Name of the assigned driver',
              example: 'John Smith'
            },
            driverPhone: {
              type: 'string',
              description: 'Driver contact phone number',
              example: '+1234567890'
            },
            status: {
              type: 'string',
              enum: ['idle', 'en_route', 'delivered'],
              description: 'Current vehicle status',
              example: 'en_route'
            },
            destination: {
              type: 'string',
              description: 'Destination location',
              example: 'Downtown Office Building'
            },
            currentLocation: {
              type: 'object',
              properties: {
                lat: {
                  type: 'number',
                  format: 'float',
                  description: 'Latitude coordinate',
                  example: 37.7749
                },
                lng: {
                  type: 'number',
                  format: 'float',
                  description: 'Longitude coordinate',
                  example: -122.4194
                }
              },
              required: ['lat', 'lng']
            },
            speed: {
              type: 'integer',
              description: 'Current speed in km/h',
              minimum: 0,
              maximum: 120,
              example: 45
            },
            lastUpdated: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2025-08-18T10:30:00.000Z'
            },
            estimatedArrival: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Estimated arrival time (null for idle/delivered vehicles)',
              example: '2025-08-18T11:30:00.000Z'
            },
            batteryLevel: {
              type: 'integer',
              description: 'Battery level percentage',
              minimum: 0,
              maximum: 100,
              example: 85
            },
            fuelLevel: {
              type: 'integer',
              description: 'Fuel level percentage',
              minimum: 0,
              maximum: 100,
              example: 75
            }
          },
          required: [
            'id', 'vehicleNumber', 'driverName', 'status', 
            'destination', 'currentLocation', 'speed', 'lastUpdated'
          ]
        },
        VehicleResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              oneOf: [
                { '$ref': '#/components/schemas/Vehicle' },
                {
                  type: 'array',
                  items: { '$ref': '#/components/schemas/Vehicle' }
                }
              ]
            },
            total: {
              type: 'integer',
              description: 'Total number of vehicles (for array responses)',
              example: 25
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-08-18T10:30:00.000Z'
            }
          }
        },
        Statistics: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              description: 'Total number of vehicles',
              example: 25
            },
            idle: {
              type: 'integer',
              description: 'Number of idle vehicles',
              example: 8
            },
            en_route: {
              type: 'integer',
              description: 'Number of vehicles en route',
              example: 12
            },
            delivered: {
              type: 'integer',
              description: 'Number of vehicles that completed delivery',
              example: 5
            },
            average_speed: {
              type: 'number',
              description: 'Average speed of all vehicles',
              example: 35.5
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-08-18T10:30:00.000Z'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Error type',
              example: 'Vehicle not found'
            },
            message: {
              type: 'string',
              description: 'Detailed error message',
              example: 'Vehicle with ID abc123 does not exist'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Vehicles',
        description: 'Vehicle management and tracking endpoints'
      },
      {
        name: 'Statistics',
        description: 'Fleet analytics and statistics'
      }
    ]
  },
  apis: ['./routes/*.js', './server.js'] // Path to the API docs
};

const specs = swaggerJSDoc(options);

module.exports = specs;
