import { app } from './app.js';
import { config } from './utils/config.js';

const PORT = config.PORT;
const HOST = '0.0.0.0';

async function start(): Promise<void> {
  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Search service running on http://${HOST}:${PORT}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();
