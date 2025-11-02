import Joi from 'joi';

export class CreateUserDto {
  name!: string;
  email!: string;
  password!: string;
}

export const createUserSchema = Joi.object<CreateUserDto>({
  name: Joi.string().min(3).max(255).required().messages({
    'string.min': 'User name should have a minimum length of {#limit}',
    'string.max': 'User name should have a maximum length of {#limit}',
    'string.empty': 'User name cannot be empty',
    'any.required': 'User name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least {#limit} characters long',
    'any.required': 'Password is required',
  }),
});

export class UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
}

export const updateUserSchema = Joi.object<UpdateUserDto>({
  name: Joi.string().min(3).max(255).messages({
    'string.min': 'User name should have a minimum length of {#limit}',
    'string.max': 'User name should have a maximum length of {#limit}',
    'string.empty': 'User name cannot be empty',
  }),
  email: Joi.string().email().messages({
    'string.email': 'Email must be a valid email address',
  }),
  password: Joi.string().min(6).messages({
    'string.min': 'Password must be at least {#limit} characters long',
  }),
})
  .or('name', 'email', 'password')
  .messages({
    'object.unknown': 'Invalid fields: {#label}',
  })
  .min(1); // At least one field is required for update
