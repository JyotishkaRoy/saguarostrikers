import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

/**
 * Validate request using express-validator rules
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      next();
      return;
    }

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  };
};

/**
 * Check validation results middleware
 */
export const checkValidation = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
    return;
  }
  
  next();
};
