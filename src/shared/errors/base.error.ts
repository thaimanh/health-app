export abstract class BaseError extends Error {
  public readonly name: string;
  public readonly httpCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;

  constructor(name: string, httpCode: number, description: string, isOperational: boolean = true) {
    super(description);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.httpCode = httpCode;
    this.isOperational = isOperational;
    this.timestamp = new Date();

    Error.captureStackTrace(this, this.constructor);

    this.stack = this.stack || '';
  }

  public toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      httpCode: this.httpCode,
      isOperational: this.isOperational,
      timestamp: this.timestamp.toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
    };
  }
}
