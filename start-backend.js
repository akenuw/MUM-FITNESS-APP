/**
 * Script to start the backend server with the correct IP address
 * Run with: node start-backend.js
 */

const { networkInterfaces } = require('os');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get the IP address
function getIPAddress() {
  const interfaces = networkInterfaces();
  let ipAddress = '';
  
  // Find a suitable IP address
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip over internal and non-IPv4 addresses
      if (!iface.internal && iface.family === 'IPv4') {
        console.log(`Found IP address: ${iface.address} (${name})`);
        ipAddress = iface.address;
      }
    }
  }
  
  return ipAddress || 'localhost';
}

// Update the API URL in services/api.js
function updateApiUrl(ipAddress) {
  const apiFilePath = path.join(__dirname, 'services', 'api.js');
  
  if (fs.existsSync(apiFilePath)) {
    let content = fs.readFileSync(apiFilePath, 'utf8');
    
    // Replace the IP address in the getBaseUrl function
    content = content.replace(
      /return ['"]http:\/\/[^:]+:5000['"]/,
      `return 'http://${ipAddress}:5000'`
    );
    
    fs.writeFileSync(apiFilePath, content);
    console.log(`Updated API URL in services/api.js to use IP: ${ipAddress}`);
  } else {
    console.log('Could not find services/api.js');
  }
}

// Start the backend server
function startBackendServer() {
  console.log('Starting backend server...');
  
  const server = spawn('npx', ['nodemon', 'src/server.js'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    shell: true
  });
  
  server.on('error', (error) => {
    console.error('Failed to start backend server:', error);
  });
  
  server.on('close', (code) => {
    console.log(`Backend server exited with code ${code}`);
  });
}

// Main function
function main() {
  const ipAddress = getIPAddress();
  console.log(`Using IP address: ${ipAddress}`);
  
  updateApiUrl(ipAddress);
  startBackendServer();
}

main();
