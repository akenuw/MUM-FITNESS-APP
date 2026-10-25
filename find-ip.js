/**
 * Simple script to find your computer's IP address
 * Run with: node find-ip.js
 */

const { networkInterfaces } = require('os');

// Get all network interfaces
const interfaces = networkInterfaces();
console.log('Your IP addresses:');

// Loop through all network interfaces
for (const name of Object.keys(interfaces)) {
  for (const iface of interfaces[name]) {
    // Skip over internal and non-IPv4 addresses
    if (!iface.internal && iface.family === 'IPv4') {
      console.log(`${name}: ${iface.address}`);
    }
  }
}

console.log('\nUpdate the IP address in services/api.js with your actual IP address');
