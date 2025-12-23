import { serve } from '@hono/node-server';
import { env } from './config/env.js';
import app from './app.js';

const startServer = async () => {
  try {

    // Start server regardless of database status
    serve({
      fetch: app.fetch,
      port: env.PORT,
    }, (info) => {
      console.log(`🚀 Server is running on http://localhost:${info.port}`);
      console.log(`📊 Health check: http://localhost:${info.port}/health`);
      console.log(`🔧 API endpoints available for testing`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();