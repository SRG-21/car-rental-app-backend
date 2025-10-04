import { notificationEnvSchema } from './validation.js';

export const config = notificationEnvSchema.parse(process.env);
