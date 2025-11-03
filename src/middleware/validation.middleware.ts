import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '../shared/errors';

export const validationMiddleware = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message).join(', ');
      return next(new ValidationError(`Validation failed: ${errorMessages}`));
    }

    next();
  };
};
