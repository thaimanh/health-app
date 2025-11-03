import pino from 'pino';
import config from '../../config';

const nodeEnv = config.get('env');

const fileTransport = pino.transport({
  targets: [
    {
      target: 'pino/file',
      options: {
        destination: './logs/app.log',
        mkdir: true,
      },
      level: 'debug',
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
              level: 'debug', // Allow debug level in pretty output
              ignore: 'pid,hostname,req,res',
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
    level: 'debug',
    timestamp: () => `,"time":"${new Date().toLocaleString()}"`,
  },
  fileTransport,
);
