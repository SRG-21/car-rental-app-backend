import { config as dotenvConfig } from 'dotenv';
import { join } from 'path';
import { authEnvSchema } from './validation.js';

// Load .env file - pnpm filter runs from the service directory
// override: true ensures .env file values take precedence over existing env vars
dotenvConfig({ path: join(process.cwd(), '.env'), override: true });

export const config = authEnvSchema.parse(process.env);

export default config;
