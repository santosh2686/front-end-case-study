// WebSocket Test Script for Fleet Tracking API
// This script tests the WebSocket connection to verify real-time updates

const WebSocket = require('ws');

// Production WebSocket URL
const WS_URL = 'wss://case-study-26cf.onrender.com';

console.log('🔌 Connecting to Fleet Tracking WebSocket...');
console.log(`📡 URL: ${WS_URL}`);

const ws = new WebSocket(WS_URL);

ws.on('open', () => {
  console.log('✅ WebSocket connection established!');
  console.log('🚗 Waiting for initial vehicle data...');
  
  // Send a ping to test bidirectional communication
  setTimeout(() => {
    console.log('📤 Sending ping to server...');
    ws.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
  }, 2000);
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    console.log('\n📨 Received message:');
    console.log(`   Type: ${message.type}`);
    console.log(`   Timestamp: ${message.timestamp}`);
    
    if (message.type === 'initial_data') {
      console.log(`   📊 Initial vehicles: ${message.data.length}`);
      console.log(`   💬 Message: ${message.message}`);
      
      // Show sample vehicle data
      if (message.data.length > 0) {
        const sample = message.data[0];
        console.log(`   🚗 Sample vehicle: ${sample.vehicleNumber} (${sample.driverName})`);
        console.log(`   📍 Location: ${sample.currentLocation.lat}, ${sample.currentLocation.lng}`);
        console.log(`   🔋 Status: ${sample.status} | Speed: ${sample.speed} km/h`);
      }
    } else if (message.type === 'vehicle_update') {
      console.log(`   🔄 Vehicle updates: ${message.data.length} vehicles`);
      console.log(`   💬 Message: ${message.message}`);
    } else if (message.type === 'pong') {
      console.log('   🏓 Received pong - connection is healthy!');
    }
  } catch (error) {
    console.error('❌ Error parsing message:', error);
    console.log('Raw message:', data.toString());
  }
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error);
});

ws.on('close', (code, reason) => {
  console.log(`\n🔌 WebSocket connection closed`);
  console.log(`   Code: ${code}`);
  console.log(`   Reason: ${reason || 'No reason provided'}`);
});

// Keep the script running and show connection status
console.log('\n🔄 Listening for real-time updates...');
console.log('💡 Vehicle positions update every 3 minutes');
console.log('⏹️  Press Ctrl+C to disconnect\n');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Disconnecting from WebSocket...');
  ws.close();
  process.exit(0);
});

// Show periodic connection status
let statusCounter = 0;
const statusInterval = setInterval(() => {
  statusCounter++;
  if (ws.readyState === WebSocket.OPEN) {
    console.log(`⏰ Connection healthy (${statusCounter * 30}s) - Waiting for updates...`);
  } else {
    console.log(`⚠️  Connection status: ${ws.readyState}`);
  }
}, 30000); // Every 30 seconds

// Cleanup
process.on('exit', () => {
  clearInterval(statusInterval);
});
