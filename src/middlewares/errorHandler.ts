import { type Request, type Response, type NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Error de validación',
      details: err.issues.map(issue => issue.message),
    });
    return;
  }
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};