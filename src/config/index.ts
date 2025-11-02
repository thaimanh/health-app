import dotenv from 'dotenv';
import convict from 'convict';
import path from 'path';

const currentEnv = process.env.NODE_ENV || 'development';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), `.env.${currentEnv}`) });

// Define a schema for our configuration
const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3000,
    env: 'PORT',
    arg: 'port',
  },
  logLevel: {
    doc: 'The level of logging to be applied.',
    format: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'],
    default: 'info',
    env: 'LOG_LEVEL',
  },
  databaseUrl: {
    doc: 'The database connection URL.',
    format: String,
    env: 'DATABASE_URL',
    default: 'mongodb://localhost:27017/nodejs-best-practices',
    sensitive: true,
  },
  rateLimit: {
    maxRequests: {
      doc: 'Maximum number of requests per windowMs.',
      format: 'int',
      default: 100, // Limit each IP to 100 requests per windowMs
      env: 'RATE_LIMIT_MAX_REQUESTS',
    },
  },
  jwt: {
    secret: {
      doc: 'Secret for signing JWT tokens.',
      format: String,
      default: 'SUPER_SECRET_JWT_KEY',
      env: 'JWT_SECRET',
      sensitive: true,
    },
    expiresIn: {
      doc: 'JWT token expiration time.',
      format: String,
      default: '1h',
      env: 'JWT_EXPIRES_IN',
    },
  },
});

const env = config.get('env');
try {
  config.loadFile(`./src/config/${env}.json`);
} catch (e) {
  console.warn(`No environment-specific config file found for ${env}. Using defaults and .env.`);
}

config.validate({ allowed: 'strict' });

export default config;
