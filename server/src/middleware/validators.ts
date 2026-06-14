import { body, param, query } from 'express-validator';

export const mongoIdParam = (field = 'id') =>
  param(field).isMongoId().withMessage(`${field} must be a valid id`);

export const mongoIdBody = (field: string) =>
  body(field).isMongoId().withMessage(`${field} must be a valid id`);

export const mongoIdQuery = (field: string) =>
  query(field).isMongoId().withMessage(`${field} must be a valid id`);

export const optionalMongoIdBody = (field: string) =>
  body(field).optional({ values: 'null' }).isMongoId().withMessage(`${field} must be a valid id`);
