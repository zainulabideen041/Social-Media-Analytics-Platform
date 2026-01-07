import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '@/types';
import { ForbiddenError, UnauthorizedError } from '@/utils/errors';

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
};
