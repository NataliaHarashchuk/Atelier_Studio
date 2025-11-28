import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import { AppError } from "./errorHandler.js";

export const authorize = (allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError("Unauthorized. Please login.", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        "Forbidden. You do not have permission to access this resource.",
        403,
      );
    }

    next();
  };
};
