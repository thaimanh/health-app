import pino from 'pino';
import pinoHttp from 'pino-http';
import config from '../../config';

const nodeEnv = config.get('env');
const logLevel = config.get('logLevel');

const fileTransport = pino.transport({
  targets: [
    {
      target: 'pino/file',
      options: {
        destination: './logs/app.log',
        mkdir: true,
      },
      level: 'info',
    },
    {
      target: 'pino/file',
      options: {
        destination: './logs/error.log',
        mkdir: true,
      },
      level: 'error',
    },

    ...(nodeEnv === 'development'
      ? [
          {
            target: 'pino-pretty',
            options: {
              colorize: true,
              ignore: 'pid,hostname',
              translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
            },
          },
        ]
      : []),
  ],
});

export const createLogger = (context: Record<string, any>) => {
  return logger.child(context);
};

export type Logger = pino.Logger;

export const logger: Logger = pino(
  {
    level: logLevel || 'info',
    timestamp: () => `,"time":"${new Date().toLocaleString()}"`,
  },
  fileTransport,
);

// HTTP logger
export const httpLogger = pinoHttp({
  logger: logger as any,
  autoLogging: true,
});
