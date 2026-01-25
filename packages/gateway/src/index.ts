import { buildApp } from './app.js';
import config from './utils/config.js';

async function start() {
  try {
    const app = await buildApp();

    await app.listen({
      port: config.PORT,
      host: '0.0.0.0'
    });

    app.log.info(`API Gateway running on port ${config.PORT}`);
    app.log.info(`Proxying to:`);
    app.log.info(`  - Auth Service: ${config.AUTH_SERVICE_URL}`);
    app.log.info(`  - Car Service: ${config.CAR_SERVICE_URL}`);
    app.log.info(`  - Search Service: ${config.SEARCH_SERVICE_URL}`);
    app.log.info(`  - Booking Service: ${config.BOOKING_SERVICE_URL}`);
    app.log.info(`  - Notification Service: ${config.NOTIFICATION_SERVICE_URL}`);
  } catch (error) {
    console.error('Failed to start API Gateway:', error);
    process.exit(1);
  }
}

start();
