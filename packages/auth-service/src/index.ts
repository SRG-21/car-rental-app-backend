import { buildApp } from './app';
import config from './utils/config';

async function start() {
  try {
    const app = await buildApp();

    await app.listen({
      port: config.PORT,
      host: '0.0.0.0'
    });

    app.log.info(`Auth Service running on port ${config.PORT}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
