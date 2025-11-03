import { UserRole } from '@prisma/client';
import Joi from 'joi';

export const createUserSchema = Joi.object({
  userName: Joi.string().alphanum().min(3).max(30).required().messages({
    'string.empty': 'Username is required',
  }),
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'First name is required',
    'string.min': 'First name must be at least 2 characters',
    'string.max': 'First name cannot exceed 50 characters',
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Last name is required',
    'string.min': 'Last name must be at least 2 characters',
    'string.max': 'Last name cannot exceed 50 characters',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters',
  }),
  phone: Joi.string()
    .pattern(/^\+?[\d\s-()]+$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
    }),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .default(UserRole.USER)
    .messages({
      'any.only': 'Role must be one of: ADMIN, USER',
    }),
});

export const updateUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'First name must be at least 2 characters',
    'string.max': 'First name cannot exceed 50 characters',
  }),
  lastName: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'Last name must be at least 2 characters',
    'string.max': 'Last name cannot exceed 50 characters',
  }),
  email: Joi.string()
    .email()
    .optional()
    .messages({ 'string.email': 'Please provide a valid email address' }),
  password: Joi.string().min(6).optional().messages({
    'string.min': 'Password must be at least 6 characters',
  }),
  phone: Joi.string()
    .pattern(/^\+?[\d\s-()]+$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
    }),
});
