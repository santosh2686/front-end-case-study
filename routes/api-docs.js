const express = require('express');
// const { VEHICLE_STATUSES } = require('../data/mockData');

const router = express.Router();

/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: Get all vehicles
 *     description: Retrieve all vehicles with optional filtering and limiting
 *     tags: [Vehicles]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [idle, en_route, delivered]
 *         description: Filter vehicles by status
 *         example: en_route
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Limit the number of results
 *         example: 10
 *     responses:
 *       200:
 *         description: List of vehicles
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/VehicleResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Vehicle'
 *             example:
 *               success: true
 *               data: [
 *                 {
 *                   "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
 *                   "vehicleNumber": "FL-001",
 *                   "driverName": "John Smith",
 *                   "driverPhone": "+1234567890",
 *                   "status": "en_route",
 *                   "destination": "Downtown Office Building",
 *                   "currentLocation": {
 *                     "lat": 37.7749,
 *                     "lng": -122.4194
 *                   },
 *                   "speed": 45,
 *                   "lastUpdated": "2025-08-18T10:30:00.000Z",
 *                   "estimatedArrival": "2025-08-18T11:30:00.000Z",
 *                   "batteryLevel": 85,
 *                   "fuelLevel": 75
 *                 }
 *               ]
 *               total: 25
 *               timestamp: "2025-08-18T10:30:00.000Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/vehicles/{id}:
 *   get:
 *     summary: Get vehicle by ID
 *     description: Retrieve a specific vehicle by its unique identifier
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vehicle unique identifier
 *         example: f47ac10b-58cc-4372-a567-0e02b2c3d479
 *     responses:
 *       200:
 *         description: Vehicle details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/VehicleResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Vehicle'
 *             example:
 *               success: true
 *               data:
 *                 id: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *                 vehicleNumber: "FL-001"
 *                 driverName: "John Smith"
 *                 driverPhone: "+1234567890"
 *                 status: "en_route"
 *                 destination: "Downtown Office Building"
 *                 currentLocation:
 *                   lat: 37.7749
 *                   lng: -122.4194
 *                 speed: 45
 *                 lastUpdated: "2025-08-18T10:30:00.000Z"
 *                 estimatedArrival: "2025-08-18T11:30:00.000Z"
 *                 batteryLevel: 85
 *                 fuelLevel: 75
 *               timestamp: "2025-08-18T10:30:00.000Z"
 *       404:
 *         description: Vehicle not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Vehicle not found"
 *               message: "Vehicle with ID f47ac10b-58cc-4372-a567-0e02b2c3d479 does not exist"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/vehicles/status/{status}:
 *   get:
 *     summary: Get vehicles by status
 *     description: Retrieve all vehicles with a specific status
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [idle, en_route, delivered]
 *         description: Vehicle status to filter by
 *         example: en_route
 *     responses:
 *       200:
 *         description: List of vehicles with specified status
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/VehicleResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Vehicle'
 *                     status:
 *                       type: string
 *                       example: "en_route"
 *             example:
 *               success: true
 *               data: []
 *               total: 12
 *               status: "en_route"
 *               timestamp: "2025-08-18T10:30:00.000Z"
 *       400:
 *         description: Invalid status parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: "Invalid status"
 *               message: "Status must be one of: idle, en_route, delivered"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/statistics:
 *   get:
 *     summary: Get fleet statistics
 *     description: Retrieve comprehensive statistics about the vehicle fleet
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Fleet statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Statistics'
 *             example:
 *               success: true
 *               data:
 *                 total: 25
 *                 idle: 8
 *                 en_route: 12
 *                 delivered: 5
 *                 average_speed: 35.5
 *                 timestamp: "2025-08-18T10:30:00.000Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

module.exports = router;
