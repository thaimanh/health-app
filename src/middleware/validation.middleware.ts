import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '../shared/errors';

type ValidationLocation = 'body' | 'params' | 'query';

export const validate = (schema: Joi.ObjectSchema, location: ValidationLocation) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[location], { abortEarly: false });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message).join(', ');
      return next(new ValidationError(`Validation failed: ${errorMessages}`));
    }

    next();
  };
};
