import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { reminderService } from './services/reminderService';

const app = express();

// Security and middleware
app.use(helmet());
app.use(cors({
  origin: [config.frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'FXEC ECE Library API',
    domainRestriction: `@${config.collegeEmailDomain}`
  });
});

// Main API routes
app.use('/api', routes);

// Centralized error handler
app.use(errorHandler);

// Start server
const PORT = config.port;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`⚡ FXEC ECE Library API Server running on port ${PORT}`);
    console.log(`📍 Endpoint: http://localhost:${PORT}/api`);
    console.log(`🔒 Domain restriction: @${config.collegeEmailDomain}`);
    console.log(`====================================================`);
    
    // Initialize automated notification / reminder cron
    reminderService.initCron();
  });
}

export default app;
