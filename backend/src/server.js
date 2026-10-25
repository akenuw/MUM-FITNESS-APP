const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const os = require('os');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('FitTrack API is running');
});

// Define routes variable to be used later
let routesRegistered = false;

// Function to register routes
const registerRoutes = () => {
  if (!routesRegistered) {
    app.use('/api/auth', authRoutes);
    app.use('/api/profile', profileRoutes);
    routesRegistered = true;
  }
};

// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    // Try to connect to database
    try {
      await connectDB();
      console.log('Database connection successful');
      // Register API routes
      registerRoutes();
    } catch (dbError) {
      console.error('Database connection failed:', dbError.message);
      console.log('Server will continue without database connection');

      // Setup fallback routes for when database is not available
      app.use('/api/auth', (req, res) => {
        res.status(503).json({
          error: 'Database connection unavailable',
          message: 'The authentication service is temporarily unavailable'
        });
      });

      app.use('/api/profile', (req, res) => {
        res.status(503).json({
          error: 'Database connection unavailable',
          message: 'The profile service is temporarily unavailable'
        });
      });
    }

    // Get network interfaces for logging
    const interfaces = os.networkInterfaces();
    const ipAddresses = Object.values(interfaces)
      .flat()
      .filter(iface => iface.family === 'IPv4' && !iface.internal)
      .map(iface => iface.address);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Server accessible at http://localhost:${PORT}`);

      // Log all available IP addresses
      ipAddresses.forEach(ip => {
        console.log(`Server accessible at http://${ip}:${PORT}`);
      });

      console.log('\nIMPORTANT: When using "npx expo start", Expo will automatically handle IP translation.');
      console.log('Make sure your device and computer are on the same network.');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
