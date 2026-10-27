import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { getDbStatus } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import roundRoutes from './routes/roundRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import playbookRoutes from './routes/playbookRoutes.js';
import demoRoutes from './routes/demoRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// API Health Check
app.get('/api/health', (req, res) => {
  const dbStatus = getDbStatus();
  res.status(200).json({
    status: 'ok',
    app: 'ApplyPilot API',
    version: '1.0.0',
    db: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/rounds', roundRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/playbooks', playbookRoutes);
app.use('/api/demo', demoRoutes);

// Production Frontend Serving
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // Serve client index.html for all non-API paths (SPA routing)
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 and Error handling for API routes
app.use('/api', notFound);
app.use(errorHandler);

export default app;
