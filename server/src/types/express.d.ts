import { Types } from 'mongoose';
import { UserRole } from '../models';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        businessId: Types.ObjectId;
      };
    }
  }
}

export {};
