import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: UserRole;
    }

    interface Request {
      user?: User;
    }
  }
}

// This export is needed to make this file a module
export {};
