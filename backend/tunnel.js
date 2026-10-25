/**
 * This script sets up a tunnel to expose the backend server to the internet
 * Run with: node tunnel.js
 */

const localtunnel = require('localtunnel');

async function setupTunnel() {
  try {
    const tunnel = await localtunnel({ 
      port: 5000,
      subdomain: 'fittrack-backend' 
    });
    
    console.log('Tunnel URL:', tunnel.url);
    console.log('Make sure to update the API URL in services/api.js');
    
    tunnel.on('close', () => {
      console.log('Tunnel closed');
    });
  } catch (error) {
    console.error('Error setting up tunnel:', error);
  }
}

setupTunnel();
